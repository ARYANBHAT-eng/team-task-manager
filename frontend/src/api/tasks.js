import apiClient from "./client";

export async function fetchTasks(projectId, filters = {}) {
  const params = {};
  if (filters.status) {
    params.status = filters.status;
  }
  if (filters.onlyAssignedToMe) {
    params.only_assigned_to_me = true;
  }

  const { data } = await apiClient.get(`/projects/${projectId}/tasks`, { params });
  return data;
}

export async function createTask(projectId, payload) {
  const { data } = await apiClient.post(`/projects/${projectId}/tasks`, payload);
  return data;
}

export async function updateTask(projectId, taskId, payload) {
  const { data } = await apiClient.patch(`/projects/${projectId}/tasks/${taskId}`, payload);
  return data;
}

export async function deleteTask(projectId, taskId) {
  await apiClient.delete(`/projects/${projectId}/tasks/${taskId}`);
}
