package aiman.dev.jobtracker.service;

import java.util.EnumMap;
import java.util.Map;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import aiman.dev.jobtracker.dto.job.JobRequest;
import aiman.dev.jobtracker.dto.job.JobResponse;
import aiman.dev.jobtracker.dto.job.JobStatusUpdateRequest;
import aiman.dev.jobtracker.exception.ResourceNotFoundException;
import aiman.dev.jobtracker.model.Job;
import aiman.dev.jobtracker.model.JobStatus;
import aiman.dev.jobtracker.model.User;
import aiman.dev.jobtracker.repository.JobRepository;
import aiman.dev.jobtracker.repository.UserRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class JobService {

    private final JobRepository jobRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public Page<JobResponse> getAllJobs(String status, String company, int page, int size) {
        User user = getCurrentUser();
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));

        Page<Job> jobs;
        if (status != null && !status.isBlank()) {
            JobStatus jobStatus = JobStatus.valueOf(status.toUpperCase());
            jobs = jobRepository.findByUserAndStatus(user, jobStatus, pageable);
        } else if (company != null && !company.isBlank()) {
            jobs = jobRepository.findByUserAndCompanyContainingIgnoreCase(user, company, pageable);
        } else {
            jobs = jobRepository.findByUser(user, pageable);
        }

        return jobs.map(JobResponse::fromEntity);
    }

    @Transactional(readOnly = true)
    public JobResponse getJobById(UUID id) {
        Job job = findJobForCurrentUser(id);
        return JobResponse.fromEntity(job);
    }

    @Transactional
    public JobResponse createJob(JobRequest request) {
        User user = getCurrentUser();

        Job job = new Job();
        job.setUser(user);
        mapRequestToEntity(request, job);

        Job saved = jobRepository.save(job);
        return JobResponse.fromEntity(saved);
    }

    @Transactional
    public JobResponse updateJob(UUID id, JobRequest request) {
        Job job = findJobForCurrentUser(id);
        mapRequestToEntity(request, job);

        Job saved = jobRepository.save(job);
        return JobResponse.fromEntity(saved);
    }

    @Transactional
    public JobResponse updateJobStatus(UUID id, JobStatusUpdateRequest request) {
        Job job = findJobForCurrentUser(id);
        job.setStatus(request.getStatus());

        Job saved = jobRepository.save(job);
        return JobResponse.fromEntity(saved);
    }

    @Transactional
    public void deleteJob(UUID id) {
        Job job = findJobForCurrentUser(id);
        jobRepository.delete(job);
    }

    @Transactional(readOnly = true)
    public Map<JobStatus, Long> getJobStats() {
        User user = getCurrentUser();
        Map<JobStatus, Long> stats = new EnumMap<>(JobStatus.class);
        for (JobStatus status : JobStatus.values()) {
            stats.put(status, jobRepository.countByUserAndStatus(user, status));
        }
        return stats;
    }

    // --- Private helpers ---

    private User getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username)
            .orElseThrow(() -> new ResourceNotFoundException("User not found."));
    }

    private Job findJobForCurrentUser(UUID id) {
        User user = getCurrentUser();
        return jobRepository.findByIdAndUser(id, user)
            .orElseThrow(() -> new ResourceNotFoundException("Job not found with id: " + id));
    }

    private void mapRequestToEntity(JobRequest request, Job job) {
        job.setCompany(request.getCompany());
        job.setRole(request.getRole());
        job.setStatus(request.getStatus());
        job.setJobUrl(request.getJobUrl());
        job.setLocation(request.getLocation());
        job.setSalary(request.getSalary());
        job.setSource(request.getSource());
        job.setAppliedDate(request.getAppliedDate());
    }
}
