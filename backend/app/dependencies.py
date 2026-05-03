from dataclasses import dataclass

from fastapi import Depends, HTTPException, Path, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.config import settings
from app.database import get_db
from app.models import Project, ProjectMembership, ProjectRole, Task, User


oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.api_v1_prefix}/auth/login")
PERMISSION_DENIED_MESSAGE = "Insufficient permissions"


@dataclass
class ProjectAccess:
    project: Project
    membership: ProjectMembership
    user: User


@dataclass
class TaskAccess:
    project_access: ProjectAccess
    task: Task


def get_current_user(db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(
            token,
            settings.jwt_secret_key,
            algorithms=[settings.jwt_algorithm],
            options={"verify_exp": True},
        )
        subject = payload.get("sub")
        if not subject:
            raise credentials_exception
        user_id = int(subject)
    except (JWTError, ValueError):
        raise credentials_exception from None

    user = db.scalar(select(User).where(User.id == user_id, User.is_active.is_(True)))
    if not user:
        raise credentials_exception
    return user


def get_project_access(
    project_id: int = Path(..., gt=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ProjectAccess:
    access_row = db.execute(
        select(ProjectMembership, Project)
        .join(Project, ProjectMembership.project_id == Project.id)
        .where(
            ProjectMembership.project_id == project_id,
            ProjectMembership.user_id == current_user.id,
        )
    ).first()
    if access_row:
        membership, project = access_row
        return ProjectAccess(project=project, membership=membership, user=current_user)

    project_exists = db.scalar(select(Project.id).where(Project.id == project_id))
    if not project_exists:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=PERMISSION_DENIED_MESSAGE)


def require_project_admin(access: ProjectAccess = Depends(get_project_access)) -> ProjectAccess:
    if access.membership.role != ProjectRole.ADMIN:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=PERMISSION_DENIED_MESSAGE)
    return access


def get_task_access(
    task_id: int = Path(..., gt=0),
    access: ProjectAccess = Depends(get_project_access),
    db: Session = Depends(get_db),
) -> TaskAccess:
    task = db.scalar(
        select(Task)
        .where(Task.id == task_id, Task.project_id == access.project.id)
        .options(selectinload(Task.creator), selectinload(Task.assignee))
    )
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
    return TaskAccess(project_access=access, task=task)


def require_task_editor(task_access: TaskAccess = Depends(get_task_access)) -> TaskAccess:
    if task_access.project_access.membership.role == ProjectRole.ADMIN:
        return task_access
    if task_access.task.assigned_to_user_id != task_access.project_access.user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=PERMISSION_DENIED_MESSAGE,
        )
    return task_access
