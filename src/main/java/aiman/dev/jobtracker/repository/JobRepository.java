package aiman.dev.jobtracker.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import aiman.dev.jobtracker.model.Job;
import aiman.dev.jobtracker.model.User;

public interface JobRepository extends JpaRepository<Job, UUID> {

    List<Job> findByUser(User user);
    Optional<Job> findByIdAndUser(UUID id, User user);

}
