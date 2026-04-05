 package com.engagement.iam_service.controller;

import com.engagement.iam_service.dto.ProfileImageUploadResponse;
import com.engagement.iam_service.dto.ProfileResponse;
import com.engagement.iam_service.dto.ProfileUpdateRequest;
import com.engagement.iam_service.model.User;
import com.engagement.iam_service.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public ResponseEntity<User> getCurrentUser(Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(userService.getUserByEmail(email));
    }

    @PutMapping({"/profile", "/me"})
    public ResponseEntity<ProfileResponse> updateProfile(
            Authentication authentication,
            @Valid @RequestBody ProfileUpdateRequest request
    ) {
        String email = authentication.getName();
        return ResponseEntity.ok(userService.updateProfile(email, request));
    }

    @GetMapping("/profile")
    public ResponseEntity<ProfileResponse> getProfile(Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(userService.getProfile(email));
    }

    @PostMapping("/profile/image")
    public ResponseEntity<ProfileImageUploadResponse> uploadProfileImage(
            Authentication authentication,
            @RequestParam("file") MultipartFile file
    ) {
        String email = authentication.getName();
        return ResponseEntity.ok(userService.uploadProfileImage(email, file));
    }

    @PostMapping("/me/face-registered")
    public ResponseEntity<User> markFaceRegistered(Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(userService.markFaceRegistered(email));
    }
}
