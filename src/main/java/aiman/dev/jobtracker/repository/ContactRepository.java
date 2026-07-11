package aiman.dev.jobtracker.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import aiman.dev.jobtracker.model.Contact;

public interface ContactRepository extends JpaRepository<Contact, UUID> {
    List<Contact> findByJobId(UUID jobId);
    Optional<Contact> findByIdAndJobId(UUID id, UUID jobId);

}
