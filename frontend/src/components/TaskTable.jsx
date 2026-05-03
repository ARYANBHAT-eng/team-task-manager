import StatusBadge from "./StatusBadge";

function formatDate(value) {
  if (!value) {
    return "No due date";
  }
  return new Date(value).toLocaleString();
}

function TaskTable({ tasks, canDelete, canEditTask, currentUserId, deletingTaskId, isTaskSubmitting, onEdit, onDelete }) {
  if (!tasks.length) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center text-sm text-gray-500 shadow-md">
        No tasks yet.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl bg-white shadow">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-100">
            <tr className="text-left text-sm font-semibold text-gray-600">
              <th className="px-4 py-2">Title</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Priority</th>
              <th className="px-4 py-2">Assignee</th>
              <th className="px-4 py-2">Due</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white text-sm text-gray-700">
            {tasks.map((task) => {
              const isMine = task.assignee?.id === currentUserId;
              const canEdit = canEditTask(task);
              const isDeleting = deletingTaskId === task.id;

              return (
                <tr key={task.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2 align-top">
                    <div className="font-medium text-gray-900">{task.title}</div>
                    {task.description ? <div className="mt-1 text-xs text-gray-500">{task.description}</div> : null}
                  </td>
                  <td className="px-4 py-2 align-top">
                    <StatusBadge status={task.status} />
                  </td>
                  <td className="px-4 py-2 align-top capitalize">{task.priority}</td>
                  <td className="px-4 py-2 align-top">
                    {task.assignee ? (
                      <div>
                        <div>{task.assignee.full_name}</div>
                        <div className="text-xs text-gray-500">
                          #{task.assignee.id} {isMine ? "| You" : ""}
                        </div>
                      </div>
                    ) : (
                      "Unassigned"
                    )}
                  </td>
                  <td className="px-4 py-2 align-top">{formatDate(task.due_date)}</td>
                  <td className="px-4 py-2 align-top">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => onEdit(task)}
                        disabled={!canEdit || isTaskSubmitting || isDeleting}
                        title={canEdit ? undefined : "Insufficient permissions"}
                        className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(task)}
                        disabled={!canDelete || isTaskSubmitting || isDeleting}
                        title={canDelete ? undefined : "Admin access required"}
                        className="rounded-lg bg-red-500 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {isDeleting ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default TaskTable;
