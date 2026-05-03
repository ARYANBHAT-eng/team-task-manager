import { useEffect, useMemo, useState } from "react";

import { createProject, deleteProject, fetchProjects, updateProject } from "../api/projects";
import ProjectCard from "../components/ProjectCard";
import ProjectForm from "../components/ProjectForm";
import { useAuth } from "../context/AuthContext";
import { getApiErrorMessage } from "../utils/api";
import { isProjectAdmin } from "../utils/project";

function ProjectsPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingProjectId, setDeletingProjectId] = useState(null);
  const [error, setError] = useState("");
  const [editingProject, setEditingProject] = useState(null);

  const sortedProjects = useMemo(
    () => [...projects].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)),
    [projects],
  );

  useEffect(() => {
    const loadProjects = async () => {
      setIsLoading(true);
      setError("");
      try {
        const data = await fetchProjects();
        setProjects(data);
      } catch (requestError) {
        setError(getApiErrorMessage(requestError, "Unable to load projects"));
      } finally {
        setIsLoading(false);
      }
    };

    loadProjects();
  }, []);

  const handleCreateProject = async (payload) => {
    setError("");
    setIsSubmitting(true);
    try {
      const createdProject = await createProject(payload);
      setProjects((current) => [createdProject, ...current]);
      return true;
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Unable to create project"));
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateProject = async (payload) => {
    if (!editingProject) {
      return false;
    }

    setError("");
    setIsSubmitting(true);
    try {
      const updatedProject = await updateProject(editingProject.id, payload);
      setProjects((current) => current.map((project) => (project.id === updatedProject.id ? updatedProject : project)));
      setEditingProject(null);
      return true;
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Unable to update project"));
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProject = async (project) => {
    if (!window.confirm(`Delete project "${project.name}"?`)) {
      return;
    }

    setError("");
    setDeletingProjectId(project.id);
    try {
      await deleteProject(project.id);
      setProjects((current) => current.filter((item) => item.id !== project.id));
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Unable to delete project"));
    } finally {
      setDeletingProjectId(null);
    }
  };

  return (
    <div className="space-y-6">
      <section className="grid gap-6 xl:grid-cols-[380px_1fr]">
        <div className="rounded-xl bg-white p-6 shadow-md">
          <h2 className="text-xl font-semibold text-gray-900">{editingProject ? "Edit project" : "Create project"}</h2>
          <p className="mt-1 text-sm text-gray-500">
            {editingProject ? "Update project details." : "Create a project and become its initial admin."}
          </p>
          <div className="mt-6">
            <ProjectForm
              initialValues={editingProject}
              onSubmit={editingProject ? handleUpdateProject : handleCreateProject}
              onCancel={editingProject ? () => setEditingProject(null) : undefined}
              isSubmitting={isSubmitting}
            />
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
            <p className="mt-1 text-sm text-gray-500">Browse projects you belong to and navigate into project task boards.</p>
          </div>
          {error ? <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-500 shadow-md">{error}</div> : null}
          {isLoading ? (
            <div className="rounded-xl bg-white p-6 text-sm text-gray-600 shadow-md">Loading projects...</div>
          ) : sortedProjects.length ? (
            <div className="grid gap-4 lg:grid-cols-2">
              {sortedProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  isAdmin={isProjectAdmin(project, user.id)}
                  isDeleting={deletingProjectId === project.id}
                  onEdit={setEditingProject}
                  onDelete={handleDeleteProject}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center text-sm text-gray-500 shadow-md">
              No projects found.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default ProjectsPage;
