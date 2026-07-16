import { useState, useEffect } from "react";

const STATUSES = ["APPLIED", "INTERVIEW", "OFFER", "REJECTED", "WITHDRAWN"];

export default function JobForm({ job, onSubmit, onCancel }) {
  const [form, setForm] = useState({
    company: "",
    role: "",
    status: "APPLIED",
    jobUrl: "",
    location: "",
    salary: "",
    source: "",
    appliedDate: "",
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (job) {
      setForm({
        company: job.company || "",
        role: job.role || "",
        status: job.status || "APPLIED",
        jobUrl: job.jobUrl || "",
        location: job.location || "",
        salary: job.salary || "",
        source: job.source || "",
        appliedDate: job.appliedDate || "",
      });
    }
  }, [job]);

  const validate = () => {
    const errs = {};
    if (!form.company.trim()) errs.company = "Company is required";
    if (!form.role.trim()) errs.role = "Role is required";
    if (!form.status) errs.status = "Status is required";
    return errs;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setSubmitting(true);
    try {
      const payload = { ...form };
      if (!payload.appliedDate) payload.appliedDate = null;
      if (!payload.jobUrl) payload.jobUrl = null;
      if (!payload.location) payload.location = null;
      if (!payload.salary) payload.salary = null;
      if (!payload.source) payload.source = null;
      await onSubmit(payload);
    } catch (err) {
      const msg = err.response?.data?.message || "Something went wrong";
      setErrors({ _general: msg });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="job-form" onSubmit={handleSubmit} id="job-form">
      {errors._general && (
        <div className="form-error-banner">{errors._general}</div>
      )}

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="job-company">Company *</label>
          <input
            id="job-company"
            name="company"
            type="text"
            value={form.company}
            onChange={handleChange}
            placeholder="e.g. Google"
            className={errors.company ? "input-error" : ""}
            maxLength={150}
          />
          {errors.company && <span className="field-error">{errors.company}</span>}
        </div>
        <div className="form-group">
          <label htmlFor="job-role">Role *</label>
          <input
            id="job-role"
            name="role"
            type="text"
            value={form.role}
            onChange={handleChange}
            placeholder="e.g. Software Engineer"
            className={errors.role ? "input-error" : ""}
            maxLength={150}
          />
          {errors.role && <span className="field-error">{errors.role}</span>}
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="job-status">Status *</label>
          <select
            id="job-status"
            name="status"
            value={form.status}
            onChange={handleChange}
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s.charAt(0) + s.slice(1).toLowerCase()}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="job-source">Source</label>
          <input
            id="job-source"
            name="source"
            type="text"
            value={form.source}
            onChange={handleChange}
            placeholder="e.g. LinkedIn, Referral"
            maxLength={100}
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="job-location">Location</label>
          <input
            id="job-location"
            name="location"
            type="text"
            value={form.location}
            onChange={handleChange}
            placeholder="e.g. Kuala Lumpur"
            maxLength={150}
          />
        </div>
        <div className="form-group">
          <label htmlFor="job-salary">Salary</label>
          <input
            id="job-salary"
            name="salary"
            type="text"
            value={form.salary}
            onChange={handleChange}
            placeholder="e.g. RM6,000/mo"
            maxLength={100}
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="job-url">Job URL</label>
          <input
            id="job-url"
            name="jobUrl"
            type="url"
            value={form.jobUrl}
            onChange={handleChange}
            placeholder="https://..."
            maxLength={500}
          />
        </div>
        <div className="form-group">
          <label htmlFor="job-applied-date">Applied Date</label>
          <input
            id="job-applied-date"
            name="appliedDate"
            type="date"
            value={form.appliedDate}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="form-actions">
        <button type="button" className="btn btn-ghost" onClick={onCancel} id="job-form-cancel">
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={submitting} id="job-form-submit">
          {submitting ? "Saving…" : job ? "Update Job" : "Add Job"}
        </button>
      </div>
    </form>
  );
}
