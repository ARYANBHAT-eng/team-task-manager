import { useState } from "react";

const roleOptions = [
  { value: "member", label: "Member" },
  { value: "admin", label: "Admin" },
];

function MemberManagement({
  members,
  currentUserId,
  isAdmin,
  isSubmitting,
  onAddMember,
  onUpdateRole,
  onRemoveMember,
}) {
  const [newMember, setNewMember] = useState({
    userId: "",
    role: "member",
  });
  const [validationError, setValidationError] = useState("");

  const handleAddMember = async (event) => {
    event.preventDefault();
    const parsedUserId = Number(newMember.userId);
    if (!Number.isInteger(parsedUserId) || parsedUserId <= 0) {
      setValidationError("Enter a valid positive user ID.");
      return;
    }

    const success = await onAddMember({
      user_id: parsedUserId,
      role: newMember.role,
    });
    if (success) {
      setNewMember({ userId: "", role: "member" });
      setValidationError("");
    }
  };

  return (
    <section className="max-w-5xl mx-auto">
      <div className="bg-white shadow-lg rounded-xl p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Project Members</h2>
          <p className="text-sm text-gray-500">
            Add registered users to this project and manage their project-level role.
          </p>
        </div>

        <form onSubmit={handleAddMember}>
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-[1.5fr_1fr_auto] gap-4 mb-2">
              <label htmlFor="member-user-id" className="text-sm font-medium text-gray-700">
                User ID
              </label>
              <label htmlFor="member-role" className="text-sm font-medium text-gray-700">
                Role
              </label>
              <div></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-[1.5fr_1fr_auto] gap-4 items-center">
              <input
                id="member-user-id"
                name="userId"
                type="number"
                value={newMember.userId}
                onChange={(event) => {
                  setNewMember((current) => ({ ...current, userId: event.target.value }));
                  if (validationError) {
                    setValidationError("");
                  }
                }}
                placeholder="Enter user ID (e.g. 2)"
                required
                disabled={isSubmitting || !isAdmin}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 h-[42px]"
              />

              <select
                id="member-role"
                name="role"
                value={newMember.role}
                onChange={(event) => setNewMember((current) => ({ ...current, role: event.target.value }))}
                disabled={isSubmitting || !isAdmin}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 h-[42px]"
              >
                {roleOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              <button
                type="submit"
                disabled={isSubmitting || !isAdmin || !newMember.userId}
                title={isAdmin ? undefined : "Admin access required"}
                className="bg-blue-600 text-white px-5 h-[42px] rounded-lg hover:bg-blue-700 transition whitespace-nowrap"
              >
                {isSubmitting ? "Saving..." : "Add member"}
              </button>
            </div>

            <p className="text-xs text-gray-500 mt-2">Enter the ID of a registered user (shown in navbar)</p>
            {validationError ? <p className="text-red-500 text-sm mt-2">{validationError}</p> : null}
          </div>
        </form>

        <div className="overflow-x-auto mt-6">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100 text-gray-600">
              <tr>
                <th className="px-4 py-2 text-left font-semibold">User</th>
                <th className="px-4 py-2 text-left font-semibold">Role</th>
                <th className="px-4 py-2 text-left font-semibold">Joined</th>
                <th className="px-4 py-2 text-left font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="text-gray-700">
              {members.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-sm text-gray-500">
                    No project members yet
                  </td>
                </tr>
              ) : (
                members.map((member) => (
                  <tr key={member.id} className="border-b hover:bg-gray-50 transition">
                    <td className="px-4 py-3 align-middle">
                      <div className="font-medium text-gray-900">{member.user.full_name}</div>
                      <div className="text-xs text-gray-500">
                        {member.user.email} | #{member.user.id}
                        {member.user.id === currentUserId ? " | You" : ""}
                      </div>
                    </td>
                    <td className="px-4 py-3 align-middle capitalize">{member.role}</td>
                    <td className="px-4 py-3 align-middle whitespace-nowrap">
                      {new Date(member.joined_at).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 align-middle">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            onUpdateRole(member.user.id, {
                              role: member.role === "admin" ? "member" : "admin",
                            })
                          }
                          disabled={isSubmitting || !isAdmin}
                          title={isAdmin ? undefined : "Admin access required"}
                          className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 whitespace-nowrap"
                        >
                          Make {member.role === "admin" ? "member" : "admin"}
                        </button>
                        <button
                          type="button"
                          onClick={() => onRemoveMember(member.user.id)}
                          disabled={isSubmitting || !isAdmin || member.user.id === currentUserId}
                          title={isAdmin ? undefined : "Admin access required"}
                          className="rounded-lg bg-red-500 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50 whitespace-nowrap"
                        >
                          Remove
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

export default MemberManagement;
