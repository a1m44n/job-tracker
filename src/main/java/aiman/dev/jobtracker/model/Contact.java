package aiman.dev.jobtracker.model;

import java.util.UUID;

import jakarta.persistence.*;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "contacts")
public class Contact {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_id", nullable = false)
    private Job job;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(length = 150)
    private String role;

    private String email;

    @Column(length = 50)
    private String phone;

    @Column(name = "linkedin_url", length = 500)
    private String linkedin_url;

}
