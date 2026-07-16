import { Link } from "react-router-dom";

const STATUS_CONFIG = {
  APPLIED: { label: "Applied", className: "status-applied", icon: "📤" },
  INTERVIEW: { label: "Interview", className: "status-interview", icon: "🎯" },
  OFFER: { label: "Offer", className: "status-offer", icon: "🎉" },
  REJECTED: { label: "Rejected", className: "status-rejected", icon: "✖" },
  WITHDRAWN: { label: "Withdrawn", className: "status-withdrawn", icon: "↩" },
};

export default function JobCard({ job }) {
  const statusInfo = STATUS_CONFIG[job.status] || STATUS_CONFIG.APPLIED;

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <Link to={`/jobs/${job.id}`} className="job-card" id={`job-card-${job.id}`}>
      <div className="job-card-header">
        <div className="job-card-company">
          <div className="job-card-avatar">
            {job.company.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="job-card-company-name">{job.company}</h3>
            <p className="job-card-role">{job.role}</p>
          </div>
        </div>
        <span className={`status-badge ${statusInfo.className}`}>
          <span className="status-icon">{statusInfo.icon}</span>
          {statusInfo.label}
        </span>
      </div>

      <div className="job-card-meta">
        {job.location && (
          <span className="meta-item" title="Location">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 1C4.79 1 3 2.79 3 5C3 8 7 13 7 13S11 8 11 5C11 2.79 9.21 1 7 1Z" stroke="currentColor" strokeWidth="1.2"/>
              <circle cx="7" cy="5" r="1.5" stroke="currentColor" strokeWidth="1.2"/>
            </svg>
            {job.location}
          </span>
        )}
        {job.salary && (
          <span className="meta-item" title="Salary">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.2"/>
              <path d="M7 3V11M5 5.5C5 4.67 5.9 4 7 4S9 4.67 9 5.5S8.1 7 7 7S5 7.67 5 8.5S5.9 10 7 10S9 9.33 9 8.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
            {job.salary}
          </span>
        )}
        {job.source && (
          <span className="meta-item" title="Source">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M5.5 8.5L8.5 5.5M6 5.5H5.5C4.39543 5.5 3.5 6.39543 3.5 7.5V8.5C3.5 9.60457 4.39543 10.5 5.5 10.5H6.5C7.60457 10.5 8.5 9.60457 8.5 8.5V8M8 8.5H8.5C9.60457 8.5 10.5 7.60457 10.5 6.5V5.5C10.5 4.39543 9.60457 3.5 8.5 3.5H7.5C6.39543 3.5 5.5 4.39543 5.5 5.5V6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
            {job.source}
          </span>
        )}
        {job.appliedDate && (
          <span className="meta-item" title="Applied date">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <rect x="1.5" y="2.5" width="11" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.2"/>
              <path d="M1.5 5.5H12.5M4.5 1V3.5M9.5 1V3.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
            {formatDate(job.appliedDate)}
          </span>
        )}
      </div>

      <div className="job-card-footer">
        <span className="meta-count" title="Contacts">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <circle cx="7" cy="4.5" r="2.5" stroke="currentColor" strokeWidth="1.2"/>
            <path d="M2 12.5C2 10.29 4.24 8.5 7 8.5S12 10.29 12 12.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
          </svg>
          {job.contactCount || 0}
        </span>
        <span className="meta-count" title="Notes">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <rect x="2" y="1.5" width="10" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.2"/>
            <path d="M4.5 5H9.5M4.5 7.5H8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
          </svg>
          {job.noteCount || 0}
        </span>
      </div>
    </Link>
  );
}
