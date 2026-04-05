package com.engagement.iam_service.dto;

import com.engagement.iam_service.model.Role;
import com.engagement.iam_service.model.UserStatus;
import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.time.LocalDate;

@Data
@Builder
public class ProfileResponse {
    private Long id;
    private String email;
    private String firstName;
    private String lastName;
    private Role role;
    private UserStatus status;

    private String phone;
    private String profileImageUrl;

    private String position;
    private String department;

    private LocalDate dateOfBirth;
    private String address;

    private boolean active;
    private Instant createdAt;
    private Instant updatedAt;

    private String token;
}
