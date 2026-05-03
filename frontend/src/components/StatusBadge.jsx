const statusStyles = {
  todo: "bg-gray-100 text-gray-700",
  in_progress: "bg-amber-100 text-amber-700",
  done: "bg-emerald-100 text-emerald-700",
};

function toLabel(status) {
  return status.replaceAll("_", " ");
}

function StatusBadge({ status }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${statusStyles[status] || statusStyles.todo}`}>
      {toLabel(status)}
    </span>
  );
}

export default StatusBadge;
