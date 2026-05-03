import { useState } from "react";

import FormField from "./FormField";
import SelectField from "./SelectField";

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
    <section className="space-y-4 rounded-xl bg-white p-6 shadow-md">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Members</h2>
        <p className="mt-1 text-sm text-gray-500">
          Add members by backend user ID. The signed-in user ID is shown in the navbar.
        </p>
      </div>

      <form onSubmit={handleAddMember} className="grid gap-4 rounded-xl bg-gray-50 p-4 md:grid-cols-[1fr_180px_auto]">
        <FormField
          label="User ID"
          name="userId"
          type="number"
          value={newMember.userId}
          onChange={(event) => {
            setNewMember((current) => ({ ...current, userId: event.target.value }));
            if (validationError) {
              setValidationError("");
            }
          }}
          required
          disabled={isSubmitting || !isAdmin}
          error={validationError}
        />
        <SelectField
          label="Role"
          name="role"
          value={newMember.role}
          onChange={(event) => setNewMember((current) => ({ ...current, role: event.target.value }))}
          options={roleOptions}
          disabled={isSubmitting || !isAdmin}
        />
        <div className="flex items-end">
          <button
            type="submit"
            disabled={isSubmitting || !isAdmin || !newMember.userId}
            title={isAdmin ? undefined : "Admin access required"}
            className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? "Saving..." : "Add member"}
          </button>
        </div>
      </form>

      <div className="overflow-hidden rounded-xl bg-white shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100 text-left text-sm font-semibold text-gray-600">
            <tr>
              <th className="px-4 py-2">User</th>
              <th className="px-4 py-2">Role</th>
              <th className="px-4 py-2">Joined</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white text-sm text-gray-700">
            {members.map((member) => (
              <tr key={member.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-2">
                  <div className="font-medium text-gray-900">{member.user.full_name}</div>
                  <div className="text-xs text-gray-500">
                    {member.user.email} | #{member.user.id}
                    {member.user.id === currentUserId ? " | You" : ""}
                  </div>
                </td>
                <td className="px-4 py-2 capitalize">{member.role}</td>
                <td className="px-4 py-2">{new Date(member.joined_at).toLocaleString()}</td>
                <td className="px-4 py-2">
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        onUpdateRole(member.user.id, {
                          role: member.role === "admin" ? "member" : "admin",
                        })
                      }
                      disabled={isSubmitting || !isAdmin}
                      title={isAdmin ? undefined : "Admin access required"}
                      className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Make {member.role === "admin" ? "member" : "admin"}
                    </button>
                    <button
                      type="button"
                      onClick={() => onRemoveMember(member.user.id)}
                      disabled={isSubmitting || !isAdmin || member.user.id === currentUserId}
                      title={isAdmin ? undefined : "Admin access required"}
                      className="rounded-lg bg-red-500 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Remove
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default MemberManagement;
