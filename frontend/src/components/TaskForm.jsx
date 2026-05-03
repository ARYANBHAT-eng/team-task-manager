import { useEffect, useState } from "react";

import FormField from "./FormField";
import SelectField from "./SelectField";
import TextAreaField from "./TextAreaField";

const statusOptions = [
  { value: "todo", label: "Todo" },
  { value: "in_progress", label: "In Progress" },
  { value: "done", label: "Done" },
];

const priorityOptions = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

function formatDatetimeLocal(value) {
  if (!value) {
    return "";
  }
  const date = new Date(value);
  const timezoneOffset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - timezoneOffset * 60000);
  return localDate.toISOString().slice(0, 16);
}

const initialState = {
  title: "",
  description: "",
  status: "todo",
  priority: "medium",
  dueDate: "",
  assignedToUserId: "",
};

function TaskForm({ initialValues, members, canManageAssignee, onSubmit, onCancel, isSubmitting }) {
  const [form, setForm] = useState(initialState);
  const [titleError, setTitleError] = useState("");
  const [formError, setFormError] = useState("");

  useEffect(() => {
    setForm({
      title: initialValues?.title || "",
      description: initialValues?.description || "",
      status: initialValues?.status || "todo",
      priority: initialValues?.priority || "medium",
      dueDate: formatDatetimeLocal(initialValues?.due_date),
      assignedToUserId:
        initialValues?.assigned_to_user_id !== null && initialValues?.assigned_to_user_id !== undefined
          ? String(initialValues.assigned_to_user_id)
          : "",
    });
    setTitleError("");
    setFormError("");
  }, [initialValues]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    if (titleError) setTitleError("");
    if (formError) setFormError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const trimmedTitle = form.title.trim();
    if (!trimmedTitle) {
      setTitleError("Task title is required.");
      return;
    }
    if (form.dueDate && Number.isNaN(new Date(form.dueDate).getTime())) {
      setFormError("Due date is invalid.");
      return;
    }

    const payload = {
      title: trimmedTitle,
      description: form.description.trim() || null,
      status: form.status,
      priority: form.priority,
      due_date: form.dueDate ? new Date(form.dueDate).toISOString() : null,
    };

    if (canManageAssignee) {
      payload.assigned_to_user_id = form.assignedToUserId ? Number(form.assignedToUserId) : null;
    }

    const success = await onSubmit(payload);

    if (success && !initialValues) {
      setForm(initialState);
    }
  };

  const assigneeOptions = [
    { value: "", label: "Unassigned" },
    ...members.map((member) => ({
      value: String(member.user.id),
      label: `${member.user.full_name} (#${member.user.id})`,
    })),
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormField
        label="Title"
        name="title"
        value={form.title}
        onChange={handleChange}
        required
        disabled={isSubmitting}
        error={titleError}
      />
      <TextAreaField
        label="Description"
        name="description"
        value={form.description}
        onChange={handleChange}
        disabled={isSubmitting}
      />
      <div className="grid gap-4 md:grid-cols-2">
        <SelectField
          label="Status"
          name="status"
          value={form.status}
          onChange={handleChange}
          options={statusOptions}
          disabled={isSubmitting}
        />
        <SelectField
          label="Priority"
          name="priority"
          value={form.priority}
          onChange={handleChange}
          options={priorityOptions}
          disabled={isSubmitting}
        />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <FormField
          label="Due date"
          name="dueDate"
          type="datetime-local"
          value={form.dueDate}
          onChange={handleChange}
          disabled={isSubmitting}
        />
        {canManageAssignee ? (
          <SelectField
            label="Assignee"
            name="assignedToUserId"
            value={form.assignedToUserId}
            onChange={handleChange}
            options={assigneeOptions}
            disabled={isSubmitting}
          />
        ) : null}
      </div>
      {formError ? <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-500">{formError}</div> : null}
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? "Saving..." : initialValues ? "Update task" : "Create task"}
        </button>
        {onCancel ? (
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>
        ) : null}
      </div>
    </form>
  );
}

export default TaskForm;
