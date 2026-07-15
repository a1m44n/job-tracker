package aiman.dev.jobtracker.dto.job;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

import aiman.dev.jobtracker.model.Job;
import aiman.dev.jobtracker.model.JobStatus;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class JobResponse {

    private UUID id;
    private String company;
    private String role;
    private JobStatus status;
    private String jobUrl;
    private String location;
    private String salary;
    private String source;
    private LocalDate appliedDate;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private int contactCount;
    private int noteCount;

    public static JobResponse fromEntity(Job job) {
        return new JobResponse(
            job.getId(),
            job.getCompany(),
            job.getRole(),
            job.getStatus(),
            job.getJobUrl(),
            job.getLocation(),
            job.getSalary(),
            job.getSource(),
            job.getAppliedDate(),
            job.getCreatedAt(),
            job.getUpdatedAt(),
            job.getContacts() != null ? job.getContacts().size() : 0,
            job.getNotes() != null ? job.getNotes().size() : 0
        );
    }
}
