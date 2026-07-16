import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getJobById,
  updateJob,
  updateJobStatus,
  deleteJob,
  getContacts,
  createContact,
  updateContact,
  deleteContact,
  getNotes,
  createNote,
  deleteNote,
} from "../api/jobApi";
import Navbar from "../components/Navbar";
import JobForm from "../components/JobForm";

const STATUS_CONFIG = {
  APPLIED: { label: "Applied", className: "status-applied" },
  INTERVIEW: { label: "Interview", className: "status-interview" },
  OFFER: { label: "Offer", className: "status-offer" },
  REJECTED: { label: "Rejected", className: "status-rejected" },
  WITHDRAWN: { label: "Withdrawn", className: "status-withdrawn" },
};

const STATUSES = ["APPLIED", "INTERVIEW", "OFFER", "REJECTED", "WITHDRAWN"];

export default function JobDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Contact form state
  const [showContactForm, setShowContactForm] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [contactForm, setContactForm] = useState({
    name: "",
    role: "",
    email: "",
    phone: "",
    linkedinUrl: "",
  });

  // Note form state
  const [newNote, setNewNote] = useState("");

  const fetchJob = useCallback(async () => {
    try {
      const res = await getJobById(id);
      setJob(res.data);
    } catch {
      navigate("/dashboard");
    }
  }, [id, navigate]);

  const fetchContacts = useCallback(async () => {
    try {
      const res = await getContacts(id);
      setContacts(res.data);
    } catch {
      // non-critical
    }
  }, [id]);

  const fetchNotes = useCallback(async () => {
    try {
      const res = await getNotes(id);
      setNotes(res.data);
    } catch {
      // non-critical
    }
  }, [id]);

  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      await Promise.all([fetchJob(), fetchContacts(), fetchNotes()]);
      setLoading(false);
    };
    loadAll();
  }, [fetchJob, fetchContacts, fetchNotes]);

  // Job actions
  const handleUpdateJob = async (data) => {
    await updateJob(id, data);
    setEditing(false);
    fetchJob();
  };

  const handleStatusChange = async (newStatus) => {
    await updateJobStatus(id, newStatus);
    fetchJob();
  };

  const handleDeleteJob = async () => {
    await deleteJob(id);
    navigate("/dashboard");
  };

  // Contact actions
  const resetContactForm = () => {
    setContactForm({ name: "", role: "", email: "", phone: "", linkedinUrl: "" });
    setEditingContact(null);
    setShowContactForm(false);
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    if (!contactForm.name.trim()) return;
    const payload = {
      ...contactForm,
      role: contactForm.role || null,
      email: contactForm.email || null,
      phone: contactForm.phone || null,
      linkedinUrl: contactForm.linkedinUrl || null,
    };
    if (editingContact) {
      await updateContact(id, editingContact.id, payload);
    } else {
      await createContact(id, payload);
    }
    resetContactForm();
    fetchContacts();
    fetchJob();
  };

  const startEditContact = (contact) => {
    setContactForm({
      name: contact.name || "",
      role: contact.role || "",
      email: contact.email || "",
      phone: contact.phone || "",
      linkedinUrl: contact.linkedinUrl || "",
    });
    setEditingContact(contact);
    setShowContactForm(true);
  };

  const handleDeleteContact = async (contactId) => {
    await deleteContact(id, contactId);
    fetchContacts();
    fetchJob();
  };

  // Note actions
  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    await createNote(id, { content: newNote.trim() });
    setNewNote("");
    fetchNotes();
    fetchJob();
  };

  const handleDeleteNote = async (noteId) => {
    await deleteNote(id, noteId);
    fetchNotes();
    fetchJob();
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="app-layout">
        <Navbar />
        <main className="main-content">
          <div className="loading-container">
            <div className="loading-spinner" />
            <p>Loading job details…</p>
          </div>
        </main>
      </div>
    );
  }

  if (!job) return null;

  const statusInfo = STATUS_CONFIG[job.status] || STATUS_CONFIG.APPLIED;

  return (
    <div className="app-layout" id="job-detail-page">
      <Navbar />
      <main className="main-content">
        {/* Back button */}
        <button className="btn btn-ghost back-btn" onClick={() => navigate("/dashboard")} id="back-to-dashboard">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back to Dashboard
        </button>

        {editing ? (
          <div className="detail-section">
            <h2>Edit Job</h2>
            <JobForm job={job} onSubmit={handleUpdateJob} onCancel={() => setEditing(false)} />
          </div>
        ) : (
          <>
            {/* Job header */}
            <div className="detail-header" id="job-detail-header">
              <div className="detail-header-left">
                <div className="detail-avatar">
                  {job.company.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h1 className="detail-company">{job.company}</h1>
                  <p className="detail-role">{job.role}</p>
                </div>
              </div>
              <div className="detail-header-right">
                <select
                  value={job.status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className={`status-select ${statusInfo.className}`}
                  id="status-select"
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s.charAt(0) + s.slice(1).toLowerCase()}
                    </option>
                  ))}
                </select>
                <button className="btn btn-ghost" onClick={() => setEditing(true)} id="edit-job-btn">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M11.5 2.5L13.5 4.5L5 13H3V11L11.5 2.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                  </svg>
                  Edit
                </button>
                <button className="btn btn-danger" onClick={() => setShowDeleteConfirm(true)} id="delete-job-btn">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M3 4H13M5.5 4V3C5.5 2.44772 5.94772 2 6.5 2H9.5C10.0523 2 10.5 2.44772 10.5 3V4M6 7V12M10 7V12M4 4L4.5 13C4.5 13.5523 4.94772 14 5.5 14H10.5C11.0523 14 11.5 13.5523 11.5 13L12 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Delete
                </button>
              </div>
            </div>

            {/* Delete confirmation */}
            {showDeleteConfirm && (
              <div className="modal-overlay" onClick={() => setShowDeleteConfirm(false)}>
                <div className="modal modal-sm" onClick={(e) => e.stopPropagation()} id="delete-confirm-modal">
                  <div className="modal-header">
                    <h2>Delete Job</h2>
                  </div>
                  <p className="modal-body-text">
                    Are you sure you want to delete <strong>{job.company} — {job.role}</strong>?
                    This will also remove all contacts and notes. This action cannot be undone.
                  </p>
                  <div className="form-actions">
                    <button className="btn btn-ghost" onClick={() => setShowDeleteConfirm(false)}>Cancel</button>
                    <button className="btn btn-danger" onClick={handleDeleteJob} id="confirm-delete-btn">Delete</button>
                  </div>
                </div>
              </div>
            )}

            {/* Job details grid */}
            <div className="detail-grid" id="job-details">
              {job.location && (
                <div className="detail-item">
                  <span className="detail-label">Location</span>
                  <span className="detail-value">{job.location}</span>
                </div>
              )}
              {job.salary && (
                <div className="detail-item">
                  <span className="detail-label">Salary</span>
                  <span className="detail-value">{job.salary}</span>
                </div>
              )}
              {job.source && (
                <div className="detail-item">
                  <span className="detail-label">Source</span>
                  <span className="detail-value">{job.source}</span>
                </div>
              )}
              {job.jobUrl && (
                <div className="detail-item">
                  <span className="detail-label">Job URL</span>
                  <a
                    className="detail-value detail-link"
                    href={job.jobUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {job.jobUrl}
                  </a>
                </div>
              )}
              {job.appliedDate && (
                <div className="detail-item">
                  <span className="detail-label">Applied Date</span>
                  <span className="detail-value">{formatDate(job.appliedDate)}</span>
                </div>
              )}
              <div className="detail-item">
                <span className="detail-label">Created</span>
                <span className="detail-value">{formatDateTime(job.createdAt)}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Last Updated</span>
                <span className="detail-value">{formatDateTime(job.updatedAt)}</span>
              </div>
            </div>
          </>
        )}

        {/* Contacts section */}
        <div className="detail-section" id="contacts-section">
          <div className="section-header">
            <h2>
              Contacts
              <span className="section-count">{contacts.length}</span>
            </h2>
            <button
              className="btn btn-ghost"
              onClick={() => {
                resetContactForm();
                setShowContactForm(true);
              }}
              id="add-contact-btn"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 3V13M3 8H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              Add Contact
            </button>
          </div>

          {showContactForm && (
            <form className="inline-form contact-form" onSubmit={handleContactSubmit} id="contact-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="contact-name">Name *</label>
                  <input
                    id="contact-name"
                    type="text"
                    value={contactForm.name}
                    onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                    placeholder="Contact name"
                    required
                    maxLength={150}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="contact-role">Role</label>
                  <input
                    id="contact-role"
                    type="text"
                    value={contactForm.role}
                    onChange={(e) => setContactForm({ ...contactForm, role: e.target.value })}
                    placeholder="e.g. Recruiter"
                    maxLength={150}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="contact-email">Email</label>
                  <input
                    id="contact-email"
                    type="email"
                    value={contactForm.email}
                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                    placeholder="email@example.com"
                    maxLength={255}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="contact-phone">Phone</label>
                  <input
                    id="contact-phone"
                    type="tel"
                    value={contactForm.phone}
                    onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                    placeholder="+60 12-345 6789"
                    maxLength={50}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="contact-linkedin">LinkedIn URL</label>
                  <input
                    id="contact-linkedin"
                    type="url"
                    value={contactForm.linkedinUrl}
                    onChange={(e) => setContactForm({ ...contactForm, linkedinUrl: e.target.value })}
                    placeholder="https://linkedin.com/in/..."
                    maxLength={500}
                  />
                </div>
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-ghost" onClick={resetContactForm}>Cancel</button>
                <button type="submit" className="btn btn-primary" id="save-contact-btn">
                  {editingContact ? "Update" : "Add"} Contact
                </button>
              </div>
            </form>
          )}

          {contacts.length === 0 && !showContactForm ? (
            <p className="empty-text">No contacts yet</p>
          ) : (
            <div className="contacts-list">
              {contacts.map((c) => (
                <div key={c.id} className="contact-card" id={`contact-${c.id}`}>
                  <div className="contact-info">
                    <div className="contact-avatar">{c.name.charAt(0).toUpperCase()}</div>
                    <div>
                      <strong className="contact-name">{c.name}</strong>
                      {c.role && <span className="contact-role">{c.role}</span>}
                      <div className="contact-details">
                        {c.email && (
                          <a href={`mailto:${c.email}`} className="contact-detail">
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                              <rect x="1" y="2.5" width="10" height="7" rx="1" stroke="currentColor" strokeWidth="1"/>
                              <path d="M1 3.5L6 7L11 3.5" stroke="currentColor" strokeWidth="1"/>
                            </svg>
                            {c.email}
                          </a>
                        )}
                        {c.phone && (
                          <a href={`tel:${c.phone}`} className="contact-detail">
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                              <path d="M4.5 1.5L3 3.5C2 5.5 3.5 8 5.5 9.5L7.5 8.5L9 9.5C9 9.5 10.5 10.5 10.5 9.5V8.5C10.5 8 10 7.5 9.5 7.5L8 8L6 6L7 4.5L6.5 3C6.5 2.5 6 2 5.5 2L4.5 1.5Z" stroke="currentColor" strokeWidth="1"/>
                            </svg>
                            {c.phone}
                          </a>
                        )}
                        {c.linkedinUrl && (
                          <a href={c.linkedinUrl} target="_blank" rel="noopener noreferrer" className="contact-detail">
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                              <rect x="1" y="1" width="10" height="10" rx="1.5" stroke="currentColor" strokeWidth="1"/>
                              <path d="M3.5 5V8.5M3.5 3.5V3.51M5.5 5V8.5M5.5 6.5C5.5 5.5 6.5 5 7.5 5C8.5 5 8.5 5.5 8.5 6.5V8.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
                            </svg>
                            LinkedIn
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="contact-actions">
                    <button className="btn-icon" onClick={() => startEditContact(c)} title="Edit contact">
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                        <path d="M11.5 2.5L13.5 4.5L5 13H3V11L11.5 2.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                      </svg>
                    </button>
                    <button className="btn-icon btn-icon-danger" onClick={() => handleDeleteContact(c.id)} title="Delete contact">
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                        <path d="M3 4H13M5.5 4V3C5.5 2.44772 5.94772 2 6.5 2H9.5C10.0523 2 10.5 2.44772 10.5 3V4M6 7V12M10 7V12M4 4L4.5 13C4.5 13.5523 4.94772 14 5.5 14H10.5C11.0523 14 11.5 13.5523 11.5 13L12 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Notes section */}
        <div className="detail-section" id="notes-section">
          <div className="section-header">
            <h2>
              Notes
              <span className="section-count">{notes.length}</span>
            </h2>
          </div>

          <form className="note-input-form" onSubmit={handleAddNote} id="note-form">
            <textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Add a note…"
              rows={3}
              id="note-input"
            />
            <button type="submit" className="btn btn-primary" disabled={!newNote.trim()} id="add-note-btn">
              Add Note
            </button>
          </form>

          {notes.length === 0 ? (
            <p className="empty-text">No notes yet</p>
          ) : (
            <div className="notes-list">
              {notes.map((n) => (
                <div key={n.id} className="note-card" id={`note-${n.id}`}>
                  <div className="note-content">{n.content}</div>
                  <div className="note-footer">
                    <span className="note-date">{formatDateTime(n.createdAt)}</span>
                    <button className="btn-icon btn-icon-danger" onClick={() => handleDeleteNote(n.id)} title="Delete note">
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                        <path d="M3 4H13M5.5 4V3C5.5 2.44772 5.94772 2 6.5 2H9.5C10.0523 2 10.5 2.44772 10.5 3V4M6 7V12M10 7V12M4 4L4.5 13C4.5 13.5523 4.94772 14 5.5 14H10.5C11.0523 14 11.5 13.5523 11.5 13L12 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
