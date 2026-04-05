package com.engagement.iam_service.dto;

import com.engagement.iam_service.model.Role;
import com.engagement.iam_service.model.UserStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminUserResponse {
    private Long id;
    private String email;
    private String firstName;
    private String lastName;
    private String phone;
    private String position;
    private String department;
    private String address;
    private String profileImageUrl;
    private Role role;
    private UserStatus status;
    private boolean active;
    private boolean faceRegistered;
    private String createdBy;
    private String updatedBy;
    private Instant createdAt;
    private Instant updatedAt;
}
