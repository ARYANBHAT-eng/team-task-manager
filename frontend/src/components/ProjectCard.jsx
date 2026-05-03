import { Link } from "react-router-dom";

function ProjectCard({ project, isAdmin, isDeleting, onEdit, onDelete }) {
  const memberCount = project.memberships?.length || 0;

  return (
    <article className="rounded-xl bg-white p-6 shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">{project.name}</h3>
          <p className="mt-2 text-sm text-gray-500">{project.description || "No description provided."}</p>
        </div>
        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
          {isAdmin ? "Admin" : "Member"}
        </span>
      </div>
      <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
        <span>{memberCount} members</span>
        <span>Created {new Date(project.created_at).toLocaleDateString()}</span>
      </div>
      <div className="mt-5 flex flex-wrap gap-3">
        <Link
          to={`/projects/${project.id}/tasks`}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
        >
          Open tasks
        </Link>
        <button
          type="button"
          onClick={() => onEdit(project)}
          disabled={!isAdmin || isDeleting}
          title={isAdmin ? undefined : "Admin access required"}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Edit
        </button>
        <button
          type="button"
          onClick={() => onDelete(project)}
          disabled={!isAdmin || isDeleting}
          title={isAdmin ? undefined : "Admin access required"}
          className="rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isDeleting ? "Deleting..." : "Delete"}
        </button>
      </div>
    </article>
  );
}

export default ProjectCard;
