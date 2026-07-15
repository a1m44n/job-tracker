package aiman.dev.jobtracker.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import aiman.dev.jobtracker.model.Job;
import aiman.dev.jobtracker.model.JobStatus;
import aiman.dev.jobtracker.model.User;

public interface JobRepository extends JpaRepository<Job, UUID> {

    List<Job> findByUser(User user);
    Optional<Job> findByIdAndUser(UUID id, User user);

    Page<Job> findByUser(User user, Pageable pageable);
    Page<Job> findByUserAndStatus(User user, JobStatus status, Pageable pageable);
    Page<Job> findByUserAndCompanyContainingIgnoreCase(User user, String company, Pageable pageable);

    long countByUserAndStatus(User user, JobStatus status);

}
