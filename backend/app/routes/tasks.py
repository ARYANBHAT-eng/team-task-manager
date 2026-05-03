from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.database import get_db
from app.dependencies import (
    PERMISSION_DENIED_MESSAGE,
    ProjectAccess,
    TaskAccess,
    get_project_access,
    get_task_access,
    require_task_editor,
)
from app.database import commit_with_rollback
from app.models import ProjectMembership, ProjectRole, Task, TaskStatus
from app.schemas import TaskCreate, TaskRead, TaskUpdate


router = APIRouter(prefix="/projects/{project_id}/tasks", tags=["tasks"])


def _get_task_or_404(db: Session, project_id: int, task_id: int) -> Task:
    task = db.scalar(
        select(Task)
        .where(Task.id == task_id, Task.project_id == project_id)
        .options(selectinload(Task.creator), selectinload(Task.assignee))
    )
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
    return task


def _ensure_project_member(db: Session, project_id: int, user_id: int) -> None:
    membership = db.scalar(
        select(ProjectMembership).where(
            ProjectMembership.project_id == project_id,
            ProjectMembership.user_id == user_id,
        )
    )
    if not membership:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Task assignee must be a project member",
        )


def _prepare_task_response(task: Task) -> Task:
    task.creator
    task.assignee
    return task


@router.get("", response_model=list[TaskRead])
def list_tasks(
    access: ProjectAccess = Depends(get_project_access),
    status_filter: TaskStatus | None = Query(default=None, alias="status"),
    only_assigned_to_me: bool = Query(default=False),
    db: Session = Depends(get_db),
) -> list[TaskRead]:
    statement = (
        select(Task)
        .where(Task.project_id == access.project.id)
        .options(selectinload(Task.creator), selectinload(Task.assignee))
        .order_by(Task.created_at.desc())
    )
    if status_filter:
        statement = statement.where(Task.status == status_filter)
    if only_assigned_to_me:
        statement = statement.where(Task.assigned_to_user_id == access.user.id)

    tasks = db.scalars(statement).all()
    return list(tasks)


@router.post("", response_model=TaskRead, status_code=status.HTTP_201_CREATED)
def create_task(
    payload: TaskCreate,
    access: ProjectAccess = Depends(get_project_access),
    db: Session = Depends(get_db),
) -> TaskRead:
    if payload.assigned_to_user_id is not None:
        _ensure_project_member(db, access.project.id, payload.assigned_to_user_id)

    task = Task(
        project_id=access.project.id,
        title=payload.title,
        description=payload.description,
        priority=payload.priority,
        due_date=payload.due_date,
        created_by_id=access.user.id,
        assigned_to_user_id=payload.assigned_to_user_id,
    )
    db.add(task)
    commit_with_rollback(db)
    db.refresh(task)
    return _prepare_task_response(task)


@router.get("/{task_id}", response_model=TaskRead)
def get_task(task_access: TaskAccess = Depends(get_task_access), db: Session = Depends(get_db)) -> TaskRead:
    return _get_task_or_404(db, task_access.project_access.project.id, task_access.task.id)


@router.patch("/{task_id}", response_model=TaskRead)
def update_task(
    payload: TaskUpdate,
    task_access: TaskAccess = Depends(require_task_editor),
    db: Session = Depends(get_db),
) -> TaskRead:
    task = task_access.task
    access = task_access.project_access
    is_admin = access.membership.role == ProjectRole.ADMIN

    if "assigned_to_user_id" in payload.model_fields_set and not is_admin:
        if payload.assigned_to_user_id != task.assigned_to_user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=PERMISSION_DENIED_MESSAGE,
            )

    if "title" in payload.model_fields_set:
        if payload.title is None:
            raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Task title cannot be null")
        task.title = payload.title
    if "description" in payload.model_fields_set:
        task.description = payload.description
    if "status" in payload.model_fields_set:
        if payload.status is None:
            raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Task status cannot be null")
        task.status = payload.status
    if "priority" in payload.model_fields_set:
        if payload.priority is None:
            raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Task priority cannot be null")
        task.priority = payload.priority
    if "due_date" in payload.model_fields_set:
        task.due_date = payload.due_date

    if is_admin and "assigned_to_user_id" in payload.model_fields_set:
        if payload.assigned_to_user_id is not None:
            _ensure_project_member(db, access.project.id, payload.assigned_to_user_id)
        task.assigned_to_user_id = payload.assigned_to_user_id

    db.add(task)
    commit_with_rollback(db)
    db.refresh(task)
    return _prepare_task_response(task)


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(
    task_access: TaskAccess = Depends(get_task_access),
    db: Session = Depends(get_db),
) -> Response:
    if task_access.project_access.membership.role != ProjectRole.ADMIN:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=PERMISSION_DENIED_MESSAGE)

    db.delete(task_access.task)
    commit_with_rollback(db)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
