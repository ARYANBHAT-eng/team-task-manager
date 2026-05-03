import { Navigate, Outlet } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

function AuthLayout() {
  const { isAuthenticated, isAuthLoading } = useAuth();

  if (isAuthLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100 p-6">
        <div className="rounded-xl bg-white px-6 py-4 text-sm text-gray-600 shadow-md">
          Loading session...
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-6">
      <Outlet />
    </div>
  );
}

export default AuthLayout;
