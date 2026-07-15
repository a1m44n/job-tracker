package aiman.dev.jobtracker.dto.contact;

import java.util.UUID;

import aiman.dev.jobtracker.model.Contact;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ContactResponse {

    private UUID id;
    private UUID jobId;
    private String name;
    private String role;
    private String email;
    private String phone;
    private String linkedinUrl;

    public static ContactResponse fromEntity(Contact contact) {
        return new ContactResponse(
            contact.getId(),
            contact.getJob().getId(),
            contact.getName(),
            contact.getRole(),
            contact.getEmail(),
            contact.getPhone(),
            contact.getLinkedinUrl()
        );
    }
}
