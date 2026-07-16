import { useState, useEffect, useCallback } from "react";
import { getJobs, getJobStats, createJob } from "../api/jobApi";
import JobCard from "../components/JobCard";
import JobForm from "../components/JobForm";
import Navbar from "../components/Navbar";

const STATUSES = [
  { value: "", label: "All Statuses" },
  { value: "APPLIED", label: "Applied" },
  { value: "INTERVIEW", label: "Interview" },
  { value: "OFFER", label: "Offer" },
  { value: "REJECTED", label: "Rejected" },
  { value: "WITHDRAWN", label: "Withdrawn" },
];

export default function DashboardPage() {
  const [jobs, setJobs] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [companySearch, setCompanySearch] = useState("");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = { page, size: 20 };
      if (statusFilter) params.status = statusFilter;
      if (companySearch.trim()) params.company = companySearch.trim();
      const res = await getJobs(params);
      setJobs(res.data.content);
      setTotalPages(res.data.totalPages);
    } catch {
      setError("Failed to load jobs");
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, companySearch]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await getJobStats();
      setStats(res.data);
    } catch {
      // stats are non-critical
    }
  }, []);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const handleCreateJob = async (data) => {
    await createJob(data);
    setShowForm(false);
    setPage(0);
    fetchJobs();
    fetchStats();
  };

  const totalJobs = Object.values(stats).reduce((a, b) => a + b, 0);

  return (
    <div className="app-layout" id="dashboard-page">
      <Navbar />
      <main className="main-content">
        {/* Stats cards */}
        <section className="stats-section" id="stats-section">
          <div className="stats-grid">
            <div className="stat-card stat-total">
              <div className="stat-number">{totalJobs}</div>
              <div className="stat-label">Total</div>
            </div>
            <div className="stat-card stat-applied">
              <div className="stat-number">{stats.APPLIED || 0}</div>
              <div className="stat-label">Applied</div>
            </div>
            <div className="stat-card stat-interview">
              <div className="stat-number">{stats.INTERVIEW || 0}</div>
              <div className="stat-label">Interview</div>
            </div>
            <div className="stat-card stat-offer">
              <div className="stat-number">{stats.OFFER || 0}</div>
              <div className="stat-label">Offer</div>
            </div>
            <div className="stat-card stat-rejected">
              <div className="stat-number">{stats.REJECTED || 0}</div>
              <div className="stat-label">Rejected</div>
            </div>
            <div className="stat-card stat-withdrawn">
              <div className="stat-number">{stats.WITHDRAWN || 0}</div>
              <div className="stat-label">Withdrawn</div>
            </div>
          </div>
        </section>

        {/* Toolbar */}
        <section className="toolbar" id="jobs-toolbar">
          <div className="toolbar-left">
            <div className="search-input-wrapper">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M11 11L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <input
                type="text"
                placeholder="Search by company…"
                value={companySearch}
                onChange={(e) => {
                  setCompanySearch(e.target.value);
                  setPage(0);
                }}
                id="company-search"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(0);
              }}
              className="status-filter"
              id="status-filter"
            >
              {STATUSES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
          <button
            className="btn btn-primary"
            onClick={() => setShowForm(true)}
            id="add-job-btn"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 3V13M3 8H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            Add Job
          </button>
        </section>

        {/* Add Job Form Modal */}
        {showForm && (
          <div className="modal-overlay" onClick={() => setShowForm(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()} id="add-job-modal">
              <div className="modal-header">
                <h2>Add New Job</h2>
                <button className="modal-close" onClick={() => setShowForm(false)} id="close-modal-btn">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M5 5L15 15M15 5L5 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </button>
              </div>
              <JobForm onSubmit={handleCreateJob} onCancel={() => setShowForm(false)} />
            </div>
          </div>
        )}

        {/* Error */}
        {error && <div className="error-banner">{error}</div>}

        {/* Job list */}
        <section className="jobs-section" id="jobs-list">
          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner" />
              <p>Loading jobs…</p>
            </div>
          ) : jobs.length === 0 ? (
            <div className="empty-state" id="empty-state">
              <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
                <rect x="8" y="12" width="48" height="40" rx="6" stroke="currentColor" strokeWidth="2" opacity="0.3"/>
                <path d="M8 22H56" stroke="currentColor" strokeWidth="2" opacity="0.3"/>
                <path d="M24 36H40M28 42H36" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.3"/>
              </svg>
              <h3>No jobs found</h3>
              <p>
                {statusFilter || companySearch
                  ? "Try adjusting your filters"
                  : "Click \"Add Job\" to start tracking your applications"}
              </p>
            </div>
          ) : (
            <>
              <div className="jobs-grid">
                {jobs.map((job) => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="pagination" id="pagination">
                  <button
                    className="btn btn-ghost"
                    disabled={page === 0}
                    onClick={() => setPage((p) => p - 1)}
                    id="prev-page"
                  >
                    ← Previous
                  </button>
                  <span className="pagination-info">
                    Page {page + 1} of {totalPages}
                  </span>
                  <button
                    className="btn btn-ghost"
                    disabled={page >= totalPages - 1}
                    onClick={() => setPage((p) => p + 1)}
                    id="next-page"
                  >
                    Next →
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      </main>
    </div>
  );
}
