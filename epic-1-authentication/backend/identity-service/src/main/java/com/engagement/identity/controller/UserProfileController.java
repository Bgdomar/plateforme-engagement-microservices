package com.engagement.identity.controller;

import com.engagement.identity.dto.ProfilResponse;
import com.engagement.identity.dto.UpdateProfilRequest;
import com.engagement.identity.service.interfaces.UserProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

@RestController
@RequestMapping("/api/profil")
@RequiredArgsConstructor
public class UserProfileController {

    private final UserProfileService userProfileService;

    @GetMapping("/{userId}")
    @PreAuthorize("hasAnyRole('STAGIAIRE', 'ENCADRANT', 'ADMINISTRATEUR')")
    public ResponseEntity<ProfilResponse> getProfil(@PathVariable UUID userId) {
        return ResponseEntity.ok(userProfileService.getProfil(userId));
    }

    @PutMapping("/{userId}")
    @PreAuthorize("hasAnyRole('STAGIAIRE', 'ENCADRANT', 'ADMINISTRATEUR')")
    public ResponseEntity<ProfilResponse> updateProfil(
            @PathVariable UUID userId,
            @RequestBody UpdateProfilRequest request) {
        return ResponseEntity.ok(userProfileService.updateProfil(userId, request));
    }

    @PostMapping("/{userId}/avatar")
    @PreAuthorize("hasAnyRole('STAGIAIRE', 'ENCADRANT', 'ADMINISTRATEUR')")
    public ResponseEntity<ProfilResponse> uploadAvatar(
            @PathVariable UUID userId,
            @RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(userProfileService.uploadAvatar(userId, file));
    }

    @DeleteMapping("/{userId}/avatar")
    @PreAuthorize("hasAnyRole('STAGIAIRE', 'ENCADRANT', 'ADMINISTRATEUR')")
    public ResponseEntity<ProfilResponse> deleteAvatar(@PathVariable UUID userId) {
        return ResponseEntity.ok(userProfileService.deleteAvatar(userId));
    }
}
