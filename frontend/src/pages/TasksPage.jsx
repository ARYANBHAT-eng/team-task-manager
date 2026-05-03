import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { addProjectMember, fetchProject, fetchProjectMembers, removeProjectMember, updateProjectMember } from "../api/projects";
import { createTask, deleteTask, fetchTasks, updateTask } from "../api/tasks";
import MemberManagement from "../components/MemberManagement";
import SelectField from "../components/SelectField";
import TaskForm from "../components/TaskForm";
import TaskTable from "../components/TaskTable";
import { useAuth } from "../context/AuthContext";
import { getApiErrorMessage } from "../utils/api";
import { getProjectMembership, isProjectAdmin } from "../utils/project";

const filterOptions = [
  { value: "", label: "All statuses" },
  { value: "todo", label: "Todo" },
  { value: "in_progress", label: "In Progress" },
  { value: "done", label: "Done" },
];

function TasksPage() {
  const { projectId } = useParams();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [members, setMembers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [isProjectLoading, setIsProjectLoading] = useState(true);
  const [isTaskListLoading, setIsTaskListLoading] = useState(true);
  const [isTaskSubmitting, setIsTaskSubmitting] = useState(false);
  const [isMemberSubmitting, setIsMemberSubmitting] = useState(false);
  const [deletingTaskId, setDeletingTaskId] = useState(null);
  const [error, setError] = useState("");
  const [taskError, setTaskError] = useState("");
  const [memberError, setMemberError] = useState("");
  const [editingTask, setEditingTask] = useState(null);
  const [filters, setFilters] = useState({
    status: "",
    onlyAssignedToMe: false,
  });

  const projectAdmin = useMemo(() => isProjectAdmin(project, user.id), [project, user.id]);
  const membership = useMemo(() => getProjectMembership(project, user.id), [project, user.id]);
  const canEditTask = (task) => projectAdmin || task.assignee?.id === user.id;

  const refreshProjectAccessData = async () => {
    const [projectData, memberData] = await Promise.all([
      fetchProject(projectId),
      fetchProjectMembers(projectId),
    ]);
    setProject(projectData);
    setMembers(memberData);
  };

  const refreshTaskData = async (activeFilters) => {
    const taskData = await fetchTasks(projectId, activeFilters);
    setTasks(taskData);
  };

  useEffect(() => {
    const loadProjectAccessData = async () => {
      setIsProjectLoading(true);
      setError("");
      try {
        await refreshProjectAccessData();
      } catch (requestError) {
        setError(getApiErrorMessage(requestError, "Unable to load project tasks"));
      } finally {
        setIsProjectLoading(false);
      }
    };

    loadProjectAccessData();
  }, [projectId]);

  useEffect(() => {
    const loadTaskData = async () => {
      setIsTaskListLoading(true);
      setTaskError("");
      try {
        await refreshTaskData(filters);
      } catch (requestError) {
        setTaskError(getApiErrorMessage(requestError, "Unable to load tasks"));
      } finally {
        setIsTaskListLoading(false);
      }
    };

    loadTaskData();
  }, [projectId, filters]);

  const handleFilterChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFilters((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleTaskSubmit = async (payload) => {
    setTaskError("");
    setIsTaskSubmitting(true);

    try {
      if (editingTask) {
        await updateTask(projectId, editingTask.id, payload);
      } else {
        await createTask(projectId, {
          title: payload.title,
          description: payload.description,
          priority: payload.priority,
          due_date: payload.due_date,
          assigned_to_user_id: payload.assigned_to_user_id,
        });
      }

      setEditingTask(null);
      await refreshTaskData(filters);
      return true;
    } catch (requestError) {
      setTaskError(getApiErrorMessage(requestError, "Unable to save task"));
      return false;
    } finally {
      setIsTaskSubmitting(false);
    }
  };

  const handleDeleteTask = async (task) => {
    if (!window.confirm(`Delete task "${task.title}"?`)) {
      return;
    }

    setTaskError("");
    setDeletingTaskId(task.id);
    try {
      await deleteTask(projectId, task.id);
      setTasks((current) => current.filter((item) => item.id !== task.id));
    } catch (requestError) {
      setTaskError(getApiErrorMessage(requestError, "Unable to delete task"));
    } finally {
      setDeletingTaskId(null);
    }
  };

  const handleAddMember = async (payload) => {
    setMemberError("");
    setIsMemberSubmitting(true);
    try {
      await addProjectMember(projectId, payload);
      await refreshProjectAccessData();
      return true;
    } catch (requestError) {
      setMemberError(getApiErrorMessage(requestError, "Unable to add member"));
      return false;
    } finally {
      setIsMemberSubmitting(false);
    }
  };

  const handleUpdateRole = async (userId, payload) => {
    setMemberError("");
    setIsMemberSubmitting(true);
    try {
      await updateProjectMember(projectId, userId, payload);
      await refreshProjectAccessData();
    } catch (requestError) {
      setMemberError(getApiErrorMessage(requestError, "Unable to update member role"));
    } finally {
      setIsMemberSubmitting(false);
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!window.confirm("Remove this member from the project?")) {
      return;
    }

    setMemberError("");
    setIsMemberSubmitting(true);
    try {
      await removeProjectMember(projectId, userId);
      await refreshProjectAccessData();
    } catch (requestError) {
      setMemberError(getApiErrorMessage(requestError, "Unable to remove member"));
    } finally {
      setIsMemberSubmitting(false);
    }
  };

  if (isProjectLoading) {
    return <div className="rounded-xl bg-white p-6 text-sm text-gray-600 shadow-md">Loading tasks...</div>;
  }

  if (error) {
    return <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-500 shadow-md">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Link to="/projects" className="hover:text-gray-700">
              Projects
            </Link>
            <span>/</span>
            <span>{project?.name}</span>
          </div>
          <h1 className="mt-2 text-2xl font-bold text-gray-900">{project?.name}</h1>
          <p className="mt-1 text-sm text-gray-500">
            {project?.description || "Project task board"} | Your role: {membership?.role || "member"}
          </p>
        </div>
      </div>

      <section className="grid gap-6 xl:grid-cols-[380px_1fr]">
        <div>
          <div className="rounded-xl bg-white p-6 shadow-md">
            <h2 className="text-xl font-semibold text-gray-900">{editingTask ? "Edit task" : "Create task"}</h2>
            <p className="mt-1 text-sm text-gray-500">
              {projectAdmin
                ? "Admins can create tasks and manage assignees."
                : "Members can create tasks. Assigned tasks can be updated by the assignee."}
            </p>
            <div className="mt-6">
              <TaskForm
                initialValues={editingTask}
                members={members}
                canManageAssignee={projectAdmin}
                onSubmit={handleTaskSubmit}
                onCancel={editingTask ? () => setEditingTask(null) : undefined}
                isSubmitting={isTaskSubmitting}
              />
            </div>
            {taskError ? <div className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-500">{taskError}</div> : null}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl bg-white p-6 shadow-md">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Tasks</h2>
                <p className="mt-1 text-sm text-gray-500">Filter project tasks and manage task lifecycle.</p>
              </div>
              <div className="grid gap-4 md:grid-cols-[220px_auto]">
                <SelectField
                  label="Status"
                  name="status"
                  value={filters.status}
                  onChange={handleFilterChange}
                  options={filterOptions}
                />
                <label className="flex items-center gap-2 pb-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    name="onlyAssignedToMe"
                    checked={filters.onlyAssignedToMe}
                    onChange={handleFilterChange}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  Assigned to me
                </label>
              </div>
            </div>
          </div>

          {isTaskListLoading ? (
            <div className="rounded-xl bg-white p-6 text-sm text-gray-600 shadow-md">Refreshing tasks...</div>
          ) : null}

          <TaskTable
            tasks={tasks}
            canDelete={projectAdmin}
            canEditTask={canEditTask}
            currentUserId={user.id}
            deletingTaskId={deletingTaskId}
            isTaskSubmitting={isTaskSubmitting}
            onEdit={setEditingTask}
            onDelete={handleDeleteTask}
          />
        </div>
      </section>

      <MemberManagement
        members={members}
        currentUserId={user.id}
        isAdmin={projectAdmin}
        isSubmitting={isMemberSubmitting}
        onAddMember={handleAddMember}
        onUpdateRole={handleUpdateRole}
        onRemoveMember={handleRemoveMember}
      />
      {memberError ? (
        <div className="max-w-4xl mx-auto rounded-lg bg-red-50 px-3 py-2 text-sm text-red-500 shadow-md">{memberError}</div>
      ) : null}
    </div>
  );
}

export default TasksPage;
