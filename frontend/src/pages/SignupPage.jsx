import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import AuthCard from "../components/AuthCard";
import FormField from "../components/FormField";
import { useAuth } from "../context/AuthContext";
import { getApiErrorMessage } from "../utils/api";

const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_LENGTH = 72;

function SignupPage() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validatePassword = (password) => {
    if (!password) {
      return "";
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      return `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
    }
    if (password.length > MAX_PASSWORD_LENGTH) {
      return `Password must be no more than ${MAX_PASSWORD_LENGTH} characters.`;
    }
    return "";
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    if (error) {
      setError("");
    }
    if (name === "password") {
      setPasswordError(validatePassword(value));
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const trimmedFullName = form.fullName.trim();
    const trimmedEmail = form.email.trim();
    if (!trimmedFullName || !trimmedEmail || !form.password) {
      setError("Full name, email, and password are required.");
      return;
    }
    const nextPasswordError = validatePassword(form.password);
    if (nextPasswordError) {
      setPasswordError(nextPasswordError);
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      await signup({
        full_name: trimmedFullName,
        email: trimmedEmail,
        password: form.password,
      });
      navigate("/dashboard", { replace: true });
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Unable to create account"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthCard
      title="Create account"
      subtitle="Register a user and start managing projects immediately."
      footer={
        <span>
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-blue-600 hover:text-blue-700">
            Sign in
          </Link>
        </span>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField
          label="Full name"
          name="fullName"
          value={form.fullName}
          onChange={handleChange}
          required
          disabled={isSubmitting}
        />
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
          label="New Password"
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          required
          disabled={isSubmitting}
          error={passwordError}
        />
        <p className="text-sm text-gray-500">
          Password must be {MIN_PASSWORD_LENGTH}-{MAX_PASSWORD_LENGTH} characters long.
        </p>
        {error ? <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-500">{error}</div> : null}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? "Creating account..." : "Create account"}
        </button>
      </form>
    </AuthCard>
  );
}

export default SignupPage;
