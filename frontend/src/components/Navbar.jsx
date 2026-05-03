import { useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <header className="bg-white shadow">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <div>
          <p className="text-sm font-semibold text-blue-600">Team Task Manager</p>
          <h1 className="text-xl font-semibold text-gray-900">Workspace</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm font-medium text-gray-900">{user?.full_name}</p>
            <p className="text-xs text-gray-500">
              {user?.email} {user?.id ? `| User ID ${user.id}` : ""}
            </p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
