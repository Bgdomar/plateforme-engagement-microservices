package com.engagement.identity.controller;

import com.engagement.identity.dto.LoginRequest;
import com.engagement.identity.dto.LoginResponse;
import com.engagement.identity.dto.ResetPasswordRequest;
import com.engagement.identity.service.interfaces.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            LoginResponse response = authService.login(request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse);
        }
    }

    @PostMapping("/facial-login")
    public ResponseEntity<?> facialLogin(@RequestBody Map<String, String> body) {
        try {
            String userId = body.get("userId");
            String userEmail = body.get("user_email");
            String identifier = (userId != null && !userId.isBlank()) ? userId : userEmail;

            if (identifier == null || identifier.isBlank()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "userId ou user_email manquant"));
            }

            LoginResponse response = authService.facialLogin(identifier);
            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody ResetPasswordRequest request) {
        try {
            authService.resetPassword(request);
            return ResponseEntity.ok(Map.of("message", "Mot de passe réinitialisé avec succès"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
