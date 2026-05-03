import { useEffect, useState } from "react";

import FormField from "./FormField";
import TextAreaField from "./TextAreaField";

const initialState = {
  name: "",
  description: "",
};

function ProjectForm({ initialValues, onSubmit, onCancel, isSubmitting }) {
  const [form, setForm] = useState(initialState);
  const [validationError, setValidationError] = useState("");

  useEffect(() => {
    setForm({
      name: initialValues?.name || "",
      description: initialValues?.description || "",
    });
    setValidationError("");
  }, [initialValues]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    if (validationError) {
      setValidationError("");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const trimmedName = form.name.trim();
    if (!trimmedName) {
      setValidationError("Project name is required.");
      return;
    }

    const success = await onSubmit({
      name: trimmedName,
      description: form.description.trim() || null,
    });

    if (success && !initialValues) {
      setForm(initialState);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormField
        label="Project name"
        name="name"
        value={form.name}
        onChange={handleChange}
        required
        disabled={isSubmitting}
        error={validationError}
      />
      <TextAreaField
        label="Description"
        name="description"
        value={form.description}
        onChange={handleChange}
        disabled={isSubmitting}
      />
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? "Saving..." : initialValues ? "Update project" : "Create project"}
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

export default ProjectForm;
