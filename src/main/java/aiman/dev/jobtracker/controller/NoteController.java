package aiman.dev.jobtracker.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import aiman.dev.jobtracker.dto.note.NoteRequest;
import aiman.dev.jobtracker.dto.note.NoteResponse;
import aiman.dev.jobtracker.service.NoteService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/jobs/{jobId}/notes")
@RequiredArgsConstructor
public class NoteController {

    private final NoteService noteService;

    @GetMapping
    public ResponseEntity<List<NoteResponse>> getNotes(@PathVariable UUID jobId) {
        return ResponseEntity.ok(noteService.getNotes(jobId));
    }

    @PostMapping
    public ResponseEntity<NoteResponse> createNote(
            @PathVariable UUID jobId,
            @Valid @RequestBody NoteRequest request) {
        NoteResponse created = noteService.createNote(jobId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNote(
            @PathVariable UUID jobId,
            @PathVariable UUID id) {
        noteService.deleteNote(jobId, id);
        return ResponseEntity.noContent().build();
    }
}
