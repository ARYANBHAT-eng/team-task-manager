import apiClient from "./client";

export async function fetchProjects() {
  const { data } = await apiClient.get("/projects");
  return data;
}

export async function createProject(payload) {
  const { data } = await apiClient.post("/projects", payload);
  return data;
}

export async function updateProject(projectId, payload) {
  const { data } = await apiClient.patch(`/projects/${projectId}`, payload);
  return data;
}

export async function deleteProject(projectId) {
  await apiClient.delete(`/projects/${projectId}`);
}

export async function fetchProject(projectId) {
  const { data } = await apiClient.get(`/projects/${projectId}`);
  return data;
}

export async function fetchProjectMembers(projectId) {
  const { data } = await apiClient.get(`/projects/${projectId}/members`);
  return data;
}

export async function addProjectMember(projectId, payload) {
  const { data } = await apiClient.post(`/projects/${projectId}/members`, payload);
  return data;
}

export async function updateProjectMember(projectId, userId, payload) {
  const { data } = await apiClient.patch(`/projects/${projectId}/members/${userId}`, payload);
  return data;
}

export async function removeProjectMember(projectId, userId) {
  await apiClient.delete(`/projects/${projectId}/members/${userId}`);
}
