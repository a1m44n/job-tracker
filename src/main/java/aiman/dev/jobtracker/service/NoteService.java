package aiman.dev.jobtracker.service;

import java.util.List;
import java.util.UUID;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import aiman.dev.jobtracker.dto.note.NoteRequest;
import aiman.dev.jobtracker.dto.note.NoteResponse;
import aiman.dev.jobtracker.exception.ResourceNotFoundException;
import aiman.dev.jobtracker.model.Job;
import aiman.dev.jobtracker.model.Note;
import aiman.dev.jobtracker.model.User;
import aiman.dev.jobtracker.repository.JobRepository;
import aiman.dev.jobtracker.repository.NoteRepository;
import aiman.dev.jobtracker.repository.UserRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class NoteService {

    private final NoteRepository noteRepository;
    private final JobRepository jobRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<NoteResponse> getNotes(UUID jobId) {
        Job job = findJobForCurrentUser(jobId);
        return noteRepository.findByJobId(job.getId()).stream()
            .map(NoteResponse::fromEntity)
            .toList();
    }

    @Transactional
    public NoteResponse createNote(UUID jobId, NoteRequest request) {
        Job job = findJobForCurrentUser(jobId);

        Note note = new Note();
        note.setJob(job);
        note.setContent(request.getContent());

        Note saved = noteRepository.save(note);
        return NoteResponse.fromEntity(saved);
    }

    @Transactional
    public void deleteNote(UUID jobId, UUID noteId) {
        findJobForCurrentUser(jobId);

        Note note = noteRepository.findByIdAndJobId(noteId, jobId)
            .orElseThrow(() -> new ResourceNotFoundException(
                "Note not found with id: " + noteId + " for job: " + jobId));

        noteRepository.delete(note);
    }

    // --- Private helpers ---

    private User getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username)
            .orElseThrow(() -> new ResourceNotFoundException("User not found."));
    }

    private Job findJobForCurrentUser(UUID jobId) {
        User user = getCurrentUser();
        return jobRepository.findByIdAndUser(jobId, user)
            .orElseThrow(() -> new ResourceNotFoundException("Job not found with id: " + jobId));
    }
}
