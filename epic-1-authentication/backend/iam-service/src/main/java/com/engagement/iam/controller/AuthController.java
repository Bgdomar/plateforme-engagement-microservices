package com.engagement.iam.controller;

import com.engagement.iam.dto.LoginRequest;
import com.engagement.iam.dto.LoginResponse;
import com.engagement.iam.service.interfaces.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
// FIX #5 : @CrossOrigin supprimé — géré globalement dans WebConfig.java
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

            if (userId == null || userId.isBlank()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "userId manquant"));
            }

            LoginResponse response = authService.facialLogin(userId);
            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
        }
    }
}