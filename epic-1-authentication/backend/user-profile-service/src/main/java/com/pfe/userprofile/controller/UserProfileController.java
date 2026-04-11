package com.pfe.userprofile.controller;

import com.pfe.userprofile.dto.ProfilResponse;
import com.pfe.userprofile.dto.UpdateProfilRequest;
import com.pfe.userprofile.service.interfaces.UserProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/profil")
@RequiredArgsConstructor
public class UserProfileController {

    private final UserProfileService userProfileService;

    @GetMapping("/{userId}")
    @PreAuthorize("hasAnyRole('STAGIAIRE', 'ENCADRANT', 'ADMIN')")
    public ResponseEntity<ProfilResponse> getProfil(@PathVariable UUID userId) {
        return ResponseEntity.ok(userProfileService.getProfil(userId));
    }

    @PutMapping("/{userId}")
    @PreAuthorize("hasAnyRole('STAGIAIRE', 'ENCADRANT', 'ADMIN')")
    public ResponseEntity<ProfilResponse> updateProfil(
            @PathVariable UUID userId,
            @RequestBody UpdateProfilRequest request) {
        return ResponseEntity.ok(userProfileService.updateProfil(userId, request));
    }

    @PostMapping("/{userId}/avatar")
    @PreAuthorize("hasAnyRole('STAGIAIRE', 'ENCADRANT', 'ADMIN')")
    public ResponseEntity<ProfilResponse> uploadAvatar(
            @PathVariable UUID userId,
            @RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(userProfileService.uploadAvatar(userId, file));
    }

    @DeleteMapping("/{userId}/avatar")
    @PreAuthorize("hasAnyRole('STAGIAIRE', 'ENCADRANT', 'ADMIN')")
    public ResponseEntity<ProfilResponse> deleteAvatar(@PathVariable UUID userId) {
        return ResponseEntity.ok(userProfileService.deleteAvatar(userId));
    }

}