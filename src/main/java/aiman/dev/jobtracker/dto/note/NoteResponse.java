package aiman.dev.jobtracker.dto.note;

import java.time.LocalDateTime;
import java.util.UUID;

import aiman.dev.jobtracker.model.Note;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class NoteResponse {

    private UUID id;
    private UUID jobId;
    private String content;
    private LocalDateTime createdAt;

    public static NoteResponse fromEntity(Note note) {
        return new NoteResponse(
            note.getId(),
            note.getJob().getId(),
            note.getContent(),
            note.getCreatedAt()
        );
    }
}
