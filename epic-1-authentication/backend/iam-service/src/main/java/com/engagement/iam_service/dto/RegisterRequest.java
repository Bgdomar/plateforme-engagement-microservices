package com.engagement.iam_service.dto;

import com.engagement.iam_service.model.Role;
import lombok.Data;

import java.time.LocalDate;

@Data
public class RegisterRequest {
    private String email;
    private String password;
    private String firstName;
    private String lastName;
    private Role role;

    private String educationLevel;
    private String school;
    private LocalDate birthDate;
}
