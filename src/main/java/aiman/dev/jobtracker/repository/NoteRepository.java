package aiman.dev.jobtracker.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import aiman.dev.jobtracker.model.Note;

public interface NoteRepository extends JpaRepository<Note, UUID> {
    List<Note> findByJobId(UUID jobId);
    Optional<Note> findByIdAndJobId(UUID id, UUID jobId);

}
