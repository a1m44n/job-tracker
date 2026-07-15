package aiman.dev.jobtracker.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import aiman.dev.jobtracker.dto.contact.ContactRequest;
import aiman.dev.jobtracker.dto.contact.ContactResponse;
import aiman.dev.jobtracker.service.ContactService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/jobs/{jobId}/contacts")
@RequiredArgsConstructor
public class ContactController {

    private final ContactService contactService;

    @GetMapping
    public ResponseEntity<List<ContactResponse>> getContacts(@PathVariable UUID jobId) {
        return ResponseEntity.ok(contactService.getContacts(jobId));
    }

    @PostMapping
    public ResponseEntity<ContactResponse> createContact(
            @PathVariable UUID jobId,
            @Valid @RequestBody ContactRequest request) {
        ContactResponse created = contactService.createContact(jobId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ContactResponse> updateContact(
            @PathVariable UUID jobId,
            @PathVariable UUID id,
            @Valid @RequestBody ContactRequest request) {
        return ResponseEntity.ok(contactService.updateContact(jobId, id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteContact(
            @PathVariable UUID jobId,
            @PathVariable UUID id) {
        contactService.deleteContact(jobId, id);
        return ResponseEntity.noContent().build();
    }
}
