package com.engagement.iam_service.dto;

import com.engagement.iam_service.model.Role;
import com.engagement.iam_service.model.UserStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MeResponse {
    private Long id;
    private String email;
    private String firstName;
    private String lastName;
    private Role role;
    private UserStatus status;

    private String educationLevel;
    private String school;
    private LocalDate birthDate;
}
