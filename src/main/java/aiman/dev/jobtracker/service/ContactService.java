package aiman.dev.jobtracker.service;

import java.util.List;
import java.util.UUID;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import aiman.dev.jobtracker.dto.contact.ContactRequest;
import aiman.dev.jobtracker.dto.contact.ContactResponse;
import aiman.dev.jobtracker.exception.ResourceNotFoundException;
import aiman.dev.jobtracker.model.Contact;
import aiman.dev.jobtracker.model.Job;
import aiman.dev.jobtracker.model.User;
import aiman.dev.jobtracker.repository.ContactRepository;
import aiman.dev.jobtracker.repository.JobRepository;
import aiman.dev.jobtracker.repository.UserRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ContactService {

    private final ContactRepository contactRepository;
    private final JobRepository jobRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<ContactResponse> getContacts(UUID jobId) {
        Job job = findJobForCurrentUser(jobId);
        return contactRepository.findByJobId(job.getId()).stream()
            .map(ContactResponse::fromEntity)
            .toList();
    }

    @Transactional
    public ContactResponse createContact(UUID jobId, ContactRequest request) {
        Job job = findJobForCurrentUser(jobId);

        Contact contact = new Contact();
        contact.setJob(job);
        mapRequestToEntity(request, contact);

        Contact saved = contactRepository.save(contact);
        return ContactResponse.fromEntity(saved);
    }

    @Transactional
    public ContactResponse updateContact(UUID jobId, UUID contactId, ContactRequest request) {
        findJobForCurrentUser(jobId);

        Contact contact = contactRepository.findByIdAndJobId(contactId, jobId)
            .orElseThrow(() -> new ResourceNotFoundException(
                "Contact not found with id: " + contactId + " for job: " + jobId));

        mapRequestToEntity(request, contact);

        Contact saved = contactRepository.save(contact);
        return ContactResponse.fromEntity(saved);
    }

    @Transactional
    public void deleteContact(UUID jobId, UUID contactId) {
        findJobForCurrentUser(jobId);

        Contact contact = contactRepository.findByIdAndJobId(contactId, jobId)
            .orElseThrow(() -> new ResourceNotFoundException(
                "Contact not found with id: " + contactId + " for job: " + jobId));

        contactRepository.delete(contact);
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

    private void mapRequestToEntity(ContactRequest request, Contact contact) {
        contact.setName(request.getName());
        contact.setRole(request.getRole());
        contact.setEmail(request.getEmail());
        contact.setPhone(request.getPhone());
        contact.setLinkedinUrl(request.getLinkedinUrl());
    }
}
