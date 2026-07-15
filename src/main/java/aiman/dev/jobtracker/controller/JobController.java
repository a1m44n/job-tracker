package aiman.dev.jobtracker.controller;

import java.util.Map;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import aiman.dev.jobtracker.dto.job.JobRequest;
import aiman.dev.jobtracker.dto.job.JobResponse;
import aiman.dev.jobtracker.dto.job.JobStatusUpdateRequest;
import aiman.dev.jobtracker.model.JobStatus;
import aiman.dev.jobtracker.service.JobService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/jobs")
@RequiredArgsConstructor
public class JobController {

    private final JobService jobService;

    @GetMapping
    public ResponseEntity<Page<JobResponse>> getAllJobs(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String company,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(jobService.getAllJobs(status, company, page, size));
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<JobStatus, Long>> getJobStats() {
        return ResponseEntity.ok(jobService.getJobStats());
    }

    @GetMapping("/{id}")
    public ResponseEntity<JobResponse> getJobById(@PathVariable UUID id) {
        return ResponseEntity.ok(jobService.getJobById(id));
    }

    @PostMapping
    public ResponseEntity<JobResponse> createJob(@Valid @RequestBody JobRequest request) {
        JobResponse created = jobService.createJob(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<JobResponse> updateJob(
            @PathVariable UUID id,
            @Valid @RequestBody JobRequest request) {
        return ResponseEntity.ok(jobService.updateJob(id, request));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<JobResponse> updateJobStatus(
            @PathVariable UUID id,
            @Valid @RequestBody JobStatusUpdateRequest request) {
        return ResponseEntity.ok(jobService.updateJobStatus(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteJob(@PathVariable UUID id) {
        jobService.deleteJob(id);
        return ResponseEntity.noContent().build();
    }
}
