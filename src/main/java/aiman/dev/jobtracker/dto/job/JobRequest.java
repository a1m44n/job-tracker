package aiman.dev.jobtracker.dto.job;

import java.time.LocalDate;

import aiman.dev.jobtracker.model.JobStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class JobRequest {

    @NotBlank
    @Size(max = 150)
    private String company;

    @NotBlank
    @Size(max = 150)
    private String role;

    @NotNull
    private JobStatus status;

    @Size(max = 500)
    private String jobUrl;

    @Size(max = 150)
    private String location;

    @Size(max = 100)
    private String salary;

    @Size(max = 100)
    private String source;

    private LocalDate appliedDate;
}
