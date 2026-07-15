package aiman.dev.jobtracker.dto.note;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class NoteRequest {

    @NotBlank
    private String content;
}
