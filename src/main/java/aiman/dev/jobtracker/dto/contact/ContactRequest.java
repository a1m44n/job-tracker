package aiman.dev.jobtracker.dto.contact;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ContactRequest {

    @NotBlank
    @Size(max = 150)
    private String name;

    @Size(max = 150)
    private String role;

    @Size(max = 255)
    private String email;

    @Size(max = 50)
    private String phone;

    @Size(max = 500)
    private String linkedinUrl;
}
