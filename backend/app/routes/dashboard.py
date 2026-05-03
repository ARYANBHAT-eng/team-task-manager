from datetime import datetime, timezone

from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models import Project, ProjectMembership, Task, TaskStatus, User
from app.schemas import DashboardRead, DashboardStatusSummary, DashboardTaskItem


router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("", response_model=DashboardRead)
def get_dashboard(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> DashboardRead:
    project_ids = db.scalars(
        select(ProjectMembership.project_id).where(ProjectMembership.user_id == current_user.id)
    ).all()

    if not project_ids:
        return DashboardRead(
            project_count=0,
            visible_task_count=0,
            assigned_task_count=0,
            overdue_count=0,
            tasks_by_status=DashboardStatusSummary(todo=0, in_progress=0, done=0),
            overdue_tasks=[],
        )

    task_rows = db.execute(
        select(Task.id, Task.status)
        .where(Task.project_id.in_(project_ids))
    ).all()
    status_counts = {TaskStatus.TODO: 0, TaskStatus.IN_PROGRESS: 0, TaskStatus.DONE: 0}
    for _, task_status in task_rows:
        status_counts[task_status] += 1

    now = datetime.now(timezone.utc)
    assigned_task_count = db.scalar(
        select(func.count(Task.id)).where(
            Task.project_id.in_(project_ids),
            Task.assigned_to_user_id == current_user.id,
        )
    ) or 0

    overdue_rows = db.execute(
        select(Task.id, Task.project_id, Task.title, Task.status, Task.priority, Task.due_date, Task.assigned_to_user_id)
        .where(
            Task.project_id.in_(project_ids),
            Task.due_date.is_not(None),
            Task.due_date < now,
            Task.status != TaskStatus.DONE,
        )
        .order_by(Task.due_date.asc())
    ).all()

    project_name_rows = db.execute(select(Project.id, Project.name).where(Project.id.in_(project_ids))).all()
    project_name_map = {project_id: project_name for project_id, project_name in project_name_rows}

    overdue_tasks = [
        DashboardTaskItem(
            id=task_id,
            project_id=project_id,
            project_name=project_name_map.get(project_id, ""),
            title=title,
            status=task_status,
            priority=priority,
            due_date=due_date,
            assigned_to_user_id=assigned_to_user_id,
        )
        for task_id, project_id, title, task_status, priority, due_date, assigned_to_user_id in overdue_rows
    ]

    return DashboardRead(
        project_count=len(project_ids),
        visible_task_count=len(task_rows),
        assigned_task_count=assigned_task_count,
        overdue_count=len(overdue_tasks),
        tasks_by_status=DashboardStatusSummary(
            todo=status_counts[TaskStatus.TODO],
            in_progress=status_counts[TaskStatus.IN_PROGRESS],
            done=status_counts[TaskStatus.DONE],
        ),
        overdue_tasks=overdue_tasks,
    )
