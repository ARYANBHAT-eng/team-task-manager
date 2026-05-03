from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field

from app.models import ProjectRole, TaskPriority, TaskStatus


class ORMModel(BaseModel):
    model_config = ConfigDict(from_attributes=True)


class UserCreate(BaseModel):
    email: EmailStr
    full_name: str = Field(min_length=1, max_length=255)
    password: str = Field(min_length=8, max_length=128)


class UserRead(ORMModel):
    id: int
    email: EmailStr
    full_name: str
    is_active: bool
    created_at: datetime
    updated_at: datetime


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class AuthResponse(Token):
    user: UserRead


class ProjectCreate(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    description: str | None = None


class ProjectUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=255)
    description: str | None = None


class ProjectMemberCreate(BaseModel):
    user_id: int
    role: ProjectRole = ProjectRole.MEMBER


class ProjectMemberUpdate(BaseModel):
    role: ProjectRole


class ProjectMemberUser(ORMModel):
    id: int
    email: EmailStr
    full_name: str


class ProjectMembershipRead(ORMModel):
    id: int
    role: ProjectRole
    joined_at: datetime
    user: ProjectMemberUser


class ProjectRead(ORMModel):
    id: int
    name: str
    description: str | None
    created_by_id: int
    created_at: datetime
    updated_at: datetime
    memberships: list[ProjectMembershipRead]


class TaskCreate(BaseModel):
    title: str = Field(min_length=1, max_length=255)
    description: str | None = None
    priority: TaskPriority = TaskPriority.MEDIUM
    due_date: datetime | None = None
    assigned_to_user_id: int | None = None


class TaskUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=255)
    description: str | None = None
    status: TaskStatus | None = None
    priority: TaskPriority | None = None
    due_date: datetime | None = None
    assigned_to_user_id: int | None = None


class TaskUser(ORMModel):
    id: int
    email: EmailStr
    full_name: str


class TaskRead(ORMModel):
    id: int
    project_id: int
    title: str
    description: str | None
    status: TaskStatus
    priority: TaskPriority
    due_date: datetime | None
    created_at: datetime
    updated_at: datetime
    creator: TaskUser
    assignee: TaskUser | None


class DashboardStatusSummary(BaseModel):
    todo: int
    in_progress: int
    done: int


class DashboardTaskItem(BaseModel):
    id: int
    project_id: int
    project_name: str
    title: str
    status: TaskStatus
    priority: TaskPriority
    due_date: datetime
    assigned_to_user_id: int | None


class DashboardRead(BaseModel):
    project_count: int
    visible_task_count: int
    assigned_task_count: int
    overdue_count: int
    tasks_by_status: DashboardStatusSummary
    overdue_tasks: list[DashboardTaskItem]
