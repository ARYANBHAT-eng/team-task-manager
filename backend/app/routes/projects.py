from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session, selectinload

from app.database import commit_with_rollback, get_db
from app.dependencies import ProjectAccess, get_current_user, get_project_access, require_project_admin
from app.models import Project, ProjectMembership, ProjectRole, User
from app.schemas import (
    ProjectCreate,
    ProjectMemberCreate,
    ProjectMemberUpdate,
    ProjectMembershipRead,
    ProjectRead,
    ProjectUpdate,
)


router = APIRouter(prefix="/projects", tags=["projects"])


def _get_project_with_members(db: Session, project_id: int) -> Project:
    project = db.scalar(
        select(Project)
        .where(Project.id == project_id)
        .options(selectinload(Project.memberships).selectinload(ProjectMembership.user))
    )
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    return project


def _get_membership_or_404(db: Session, project_id: int, user_id: int) -> ProjectMembership:
    membership = db.scalar(
        select(ProjectMembership)
        .where(ProjectMembership.project_id == project_id, ProjectMembership.user_id == user_id)
        .options(selectinload(ProjectMembership.user))
    )
    if not membership:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project membership not found")
    return membership


def _prepare_project_response(project: Project) -> Project:
    for membership in project.memberships:
        membership.user
    return project


def _prepare_membership_response(membership: ProjectMembership) -> ProjectMembership:
    membership.user
    return membership


@router.get("", response_model=list[ProjectRead])
def list_projects(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[ProjectRead]:
    projects = (
        db.scalars(
            select(Project)
            .join(ProjectMembership, ProjectMembership.project_id == Project.id)
            .where(ProjectMembership.user_id == current_user.id)
            .options(selectinload(Project.memberships).selectinload(ProjectMembership.user))
            .order_by(Project.created_at.desc())
        )
        .unique()
        .all()
    )
    return list(projects)


@router.post("", response_model=ProjectRead, status_code=status.HTTP_201_CREATED)
def create_project(
    payload: ProjectCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ProjectRead:
    project = Project(
        name=payload.name,
        description=payload.description,
        created_by_id=current_user.id,
    )
    db.add(project)
    db.flush()

    admin_membership = ProjectMembership(
        project_id=project.id,
        user_id=current_user.id,
        role=ProjectRole.ADMIN,
    )
    db.add(admin_membership)
    commit_with_rollback(db)
    db.refresh(project)

    return _prepare_project_response(project)


@router.get("/{project_id}", response_model=ProjectRead)
def get_project(access: ProjectAccess = Depends(get_project_access), db: Session = Depends(get_db)) -> ProjectRead:
    return _get_project_with_members(db, access.project.id)


@router.patch("/{project_id}", response_model=ProjectRead)
def update_project(
    payload: ProjectUpdate,
    access: ProjectAccess = Depends(require_project_admin),
    db: Session = Depends(get_db),
) -> ProjectRead:
    if "name" in payload.model_fields_set:
        if payload.name is None:
            raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Project name cannot be null")
        access.project.name = payload.name
    if "description" in payload.model_fields_set:
        access.project.description = payload.description

    db.add(access.project)
    commit_with_rollback(db)
    db.refresh(access.project)
    return _prepare_project_response(access.project)


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_project(access: ProjectAccess = Depends(require_project_admin), db: Session = Depends(get_db)) -> Response:
    db.delete(access.project)
    commit_with_rollback(db)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.get("/{project_id}/members", response_model=list[ProjectMembershipRead])
def list_project_members(
    access: ProjectAccess = Depends(get_project_access),
    db: Session = Depends(get_db),
) -> list[ProjectMembershipRead]:
    memberships = (
        db.scalars(
            select(ProjectMembership)
            .where(ProjectMembership.project_id == access.project.id)
            .options(selectinload(ProjectMembership.user))
            .order_by(ProjectMembership.joined_at.asc())
        )
        .unique()
        .all()
    )
    return list(memberships)


@router.post("/{project_id}/members", response_model=ProjectMembershipRead, status_code=status.HTTP_201_CREATED)
def add_project_member(
    payload: ProjectMemberCreate,
    access: ProjectAccess = Depends(require_project_admin),
    db: Session = Depends(get_db),
) -> ProjectMembershipRead:
    user = db.scalar(select(User).where(User.id == payload.user_id, User.is_active.is_(True)))
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    existing_membership = db.scalar(
        select(ProjectMembership).where(
            ProjectMembership.project_id == access.project.id,
            ProjectMembership.user_id == payload.user_id,
        )
    )
    if existing_membership:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="User is already a project member")

    membership = ProjectMembership(
        project_id=access.project.id,
        user_id=payload.user_id,
        role=payload.role,
    )
    db.add(membership)
    commit_with_rollback(db)
    db.refresh(membership)
    return _prepare_membership_response(membership)


@router.patch("/{project_id}/members/{user_id}", response_model=ProjectMembershipRead)
def update_project_member_role(
    payload: ProjectMemberUpdate,
    user_id: int,
    access: ProjectAccess = Depends(require_project_admin),
    db: Session = Depends(get_db),
) -> ProjectMembershipRead:
    membership = _get_membership_or_404(db, access.project.id, user_id)

    if membership.role == ProjectRole.ADMIN and payload.role != ProjectRole.ADMIN:
        admin_count = db.scalar(
            select(func.count(ProjectMembership.id)).where(
                ProjectMembership.project_id == access.project.id,
                ProjectMembership.role == ProjectRole.ADMIN,
            )
        )
        if admin_count == 1:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Project must retain at least one admin",
            )

    membership.role = payload.role
    db.add(membership)
    commit_with_rollback(db)
    db.refresh(membership)
    return _prepare_membership_response(membership)


@router.delete("/{project_id}/members/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_project_member(
    user_id: int,
    access: ProjectAccess = Depends(require_project_admin),
    db: Session = Depends(get_db),
) -> Response:
    membership = _get_membership_or_404(db, access.project.id, user_id)

    if membership.role == ProjectRole.ADMIN:
        admin_count = db.scalar(
            select(func.count(ProjectMembership.id)).where(
                ProjectMembership.project_id == access.project.id,
                ProjectMembership.role == ProjectRole.ADMIN,
            )
        )
        if admin_count == 1:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Project must retain at least one admin",
            )

    db.delete(membership)
    commit_with_rollback(db)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
