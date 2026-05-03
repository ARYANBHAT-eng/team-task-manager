import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { fetchDashboard } from "../api/dashboard";
import StatusBadge from "../components/StatusBadge";
import { getApiErrorMessage } from "../utils/api";

const metricToneStyles = {
  neutral: "border-gray-200 bg-white",
  danger: "border-red-200 bg-red-50",
  success: "border-emerald-200 bg-emerald-50",
};

function MetricCard({ label, value, tone = "neutral" }) {
  return (
    <div className={`rounded-xl border p-6 shadow-md ${metricToneStyles[tone] || metricToneStyles.neutral}`}>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
    </div>
  );
}

function DashboardPage() {
  const [dashboard, setDashboard] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      setIsLoading(true);
      setError("");
      try {
        const data = await fetchDashboard();
        setDashboard(data);
      } catch (requestError) {
        setError(getApiErrorMessage(requestError, "Unable to load dashboard"));
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboard();
  }, []);

  if (isLoading) {
    return <div className="rounded-xl bg-white p-6 text-sm text-gray-600 shadow-md">Loading dashboard...</div>;
  }

  if (error) {
    return <div className="rounded-xl bg-red-50 p-4 text-sm text-red-500 shadow-md">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <section>
        <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
        <p className="mt-1 text-sm text-gray-500">Assigned workload, overdue items, and project-wide task status.</p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Projects" value={dashboard.project_count} />
        <MetricCard label="Visible tasks" value={dashboard.visible_task_count} />
        <MetricCard label="Assigned to me" value={dashboard.assigned_task_count} />
        <MetricCard label="Overdue tasks" value={dashboard.overdue_count} tone="danger" />
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <MetricCard label="Todo" value={dashboard.tasks_by_status.todo} />
        <MetricCard label="In progress" value={dashboard.tasks_by_status.in_progress} />
        <MetricCard label="Done" value={dashboard.tasks_by_status.done} tone="success" />
      </section>

      <section className="rounded-xl bg-white p-6 shadow-md">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Overdue tasks</h3>
            <p className="mt-1 text-sm text-gray-500">Tasks not marked done and already past due.</p>
          </div>
          <Link to="/projects" className="text-sm font-medium text-blue-600 hover:text-blue-700">
            View projects
          </Link>
        </div>

        {!dashboard.overdue_tasks.length ? (
          <div className="mt-6 rounded-xl border border-dashed border-gray-300 p-6 text-center text-sm text-gray-500">
            No overdue tasks.
          </div>
        ) : (
          <div className="mt-6 space-y-3">
            {dashboard.overdue_tasks.map((task) => (
              <div
                key={task.id}
                className="flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 p-4 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-red-950">{task.title}</h4>
                    <StatusBadge status={task.status} />
                  </div>
                  <p className="mt-1 text-sm text-red-700">
                    {task.project_name} | Due {new Date(task.due_date).toLocaleString()}
                  </p>
                </div>
                <Link
                  to={`/projects/${task.project_id}/tasks`}
                  className="rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-100"
                >
                  Open task board
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default DashboardPage;
