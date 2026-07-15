package aiman.dev.jobtracker.dto.job;

import aiman.dev.jobtracker.model.JobStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class JobStatusUpdateRequest {

    @NotNull
    private JobStatus status;
}
