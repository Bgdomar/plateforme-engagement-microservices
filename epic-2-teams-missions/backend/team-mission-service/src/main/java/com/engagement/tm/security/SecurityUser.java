package com.engagement.tm.security;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class SecurityUser {
    private String email;
    private Long userId;
    private String role;
}