// dto/LoginResponse.java
package com.engagement.iam.dto;

import lombok.*;

import java.util.UUID;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class LoginResponse {
    private String token;
    private String role;
    private long userId;
    private String email;
    private String redirectUrl; // /dashboard/stagiaire, /dashboard/encadrant, /dashboard/admin
}