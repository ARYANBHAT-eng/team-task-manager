export function getProjectMembership(project, userId) {
  return project?.memberships?.find((membership) => membership.user.id === userId) || null;
}

export function isProjectAdmin(project, userId) {
  return getProjectMembership(project, userId)?.role === "admin";
}
