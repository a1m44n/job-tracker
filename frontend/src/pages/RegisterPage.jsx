import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register as registerApi } from "../api/authApi";
import { useAuth } from "../context/AuthContext";

export default function RegisterPage() {
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError("");
    if (fieldErrors[e.target.name])
      setFieldErrors((prev) => ({ ...prev, [e.target.name]: undefined }));
  };

  const validate = () => {
    const errs = {};
    if (!form.username.trim()) errs.username = "Username is required";
    else if (form.username.length < 3) errs.username = "At least 3 characters";
    if (!form.email.trim()) errs.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = "Invalid email";
    if (!form.password) errs.password = "Password is required";
    else if (form.password.length < 6) errs.password = "At least 6 characters";
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setFieldErrors(errs);
      return;
    }
    setLoading(true);
    try {
      const res = await registerApi(form);
      login(res.data.token, res.data.username);
      navigate("/dashboard");
    } catch (err) {
      if (err.response?.data?.errors) {
        const serverErrs = {};
        err.response.data.errors.forEach((e) => {
          serverErrs[e.field] = e.defaultMessage || e.message;
        });
        setFieldErrors(serverErrs);
      } else {
        setError(err.response?.data?.message || "Registration failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page" id="register-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <div className="auth-logo">
              <svg width="40" height="40" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="2" y="4" width="24" height="20" rx="3" stroke="currentColor" strokeWidth="2"/>
                <path d="M2 10H26" stroke="currentColor" strokeWidth="2"/>
                <circle cx="7" cy="7" r="1.5" fill="currentColor"/>
                <circle cx="12" cy="7" r="1.5" fill="currentColor"/>
                <path d="M8 16H20M8 20H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <h1>Create account</h1>
            <p>Start tracking your job applications</p>
          </div>

          {error && <div className="auth-error" id="register-error">{error}</div>}

          <form onSubmit={handleSubmit} id="register-form">
            <div className="form-group">
              <label htmlFor="register-username">Username</label>
              <input
                id="register-username"
                name="username"
                type="text"
                value={form.username}
                onChange={handleChange}
                placeholder="Choose a username"
                autoComplete="username"
                className={fieldErrors.username ? "input-error" : ""}
                autoFocus
              />
              {fieldErrors.username && <span className="field-error">{fieldErrors.username}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="register-email">Email</label>
              <input
                id="register-email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                autoComplete="email"
                className={fieldErrors.email ? "input-error" : ""}
              />
              {fieldErrors.email && <span className="field-error">{fieldErrors.email}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="register-password">Password</label>
              <input
                id="register-password"
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Min. 6 characters"
                autoComplete="new-password"
                className={fieldErrors.password ? "input-error" : ""}
              />
              {fieldErrors.password && <span className="field-error">{fieldErrors.password}</span>}
            </div>
            <button
              type="submit"
              className="btn btn-primary btn-full"
              disabled={loading}
              id="register-submit"
            >
              {loading ? "Creating account…" : "Create Account"}
            </button>
          </form>

          <p className="auth-switch">
            Already have an account?{" "}
            <Link to="/login" id="goto-login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
