import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import AuthCard from "../components/AuthCard";
import FormField from "../components/FormField";
import { useAuth } from "../context/AuthContext";
import { getApiErrorMessage } from "../utils/api";

function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const redirectTo = location.state?.from?.pathname || "/dashboard";

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    if (error) {
      setError("");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const trimmedEmail = form.email.trim();
    if (!trimmedEmail || !form.password) {
      setError("Email and password are required.");
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      await login(trimmedEmail, form.password);
      navigate(redirectTo, { replace: true });
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Unable to log in"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthCard
      title="Sign in"
      subtitle="Access your projects, tasks, and dashboard."
      footer={
        <span>
          No account yet?{" "}
          <Link to="/signup" className="font-medium text-blue-600 hover:text-blue-700">
            Create one
          </Link>
        </span>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField
          label="Email"
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          required
          disabled={isSubmitting}
        />
        <FormField
          label="Password"
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          required
          disabled={isSubmitting}
        />
        {error ? <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-500">{error}</div> : null}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </AuthCard>
  );
}

export default LoginPage;
