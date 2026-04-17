package com.engagement.identity.dto;

import lombok.*;

import java.util.UUID;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class LoginResponse {
    private String token;
    private String role;
    private UUID userId;
    private String email;
    private String redirectUrl;
}
