import axiosClient from "./axiosClient";

// Jobs
export const getJobs = (params) =>
  axiosClient.get("/jobs", { params });

export const getJobById = (id) =>
  axiosClient.get(`/jobs/${id}`);

export const createJob = (data) =>
  axiosClient.post("/jobs", data);

export const updateJob = (id, data) =>
  axiosClient.put(`/jobs/${id}`, data);

export const updateJobStatus = (id, status) =>
  axiosClient.patch(`/jobs/${id}/status`, { status });

export const deleteJob = (id) =>
  axiosClient.delete(`/jobs/${id}`);

export const getJobStats = () =>
  axiosClient.get("/jobs/stats");

// Contacts
export const getContacts = (jobId) =>
  axiosClient.get(`/jobs/${jobId}/contacts`);

export const createContact = (jobId, data) =>
  axiosClient.post(`/jobs/${jobId}/contacts`, data);

export const updateContact = (jobId, id, data) =>
  axiosClient.put(`/jobs/${jobId}/contacts/${id}`, data);

export const deleteContact = (jobId, id) =>
  axiosClient.delete(`/jobs/${jobId}/contacts/${id}`);

// Notes
export const getNotes = (jobId) =>
  axiosClient.get(`/jobs/${jobId}/notes`);

export const createNote = (jobId, data) =>
  axiosClient.post(`/jobs/${jobId}/notes`, data);

export const deleteNote = (jobId, id) =>
  axiosClient.delete(`/jobs/${jobId}/notes/${id}`);
