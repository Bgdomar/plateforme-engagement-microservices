package com.engagement.iam.controller;


import com.engagement.iam.dto.*;
import com.engagement.iam.service.interfaces.ProfilService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/profil")
@RequiredArgsConstructor
public class ProfilController {

    private final ProfilService profilService;

    @GetMapping("/{userId}")
    @PreAuthorize("hasAnyRole('STAGIAIRE', 'ENCADRANT', 'ADMINISTRATEUR')")
    public ResponseEntity<ProfilResponse> getProfil(@PathVariable Long userId) {
        return ResponseEntity.ok(profilService.getProfil(userId));
    }

    @PutMapping("/{userId}")
    @PreAuthorize("hasAnyRole('STAGIAIRE', 'ENCADRANT', 'ADMINISTRATEUR')")
    public ResponseEntity<ProfilResponse> updateProfil(
            @PathVariable Long userId,
            @RequestBody UpdateProfilRequest request) {
        return ResponseEntity.ok(profilService.updateProfil(userId, request));
    }

    @PostMapping("/{userId}/avatar")
    @PreAuthorize("hasAnyRole('STAGIAIRE', 'ENCADRANT', 'ADMINISTRATEUR')")
    public ResponseEntity<ProfilResponse> uploadAvatar(
            @PathVariable Long userId,
            @RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(profilService.uploadAvatar(userId, file));
    }

    @DeleteMapping("/{userId}/avatar")
    @PreAuthorize("hasAnyRole('STAGIAIRE', 'ENCADRANT', 'ADMINISTRATEUR')")
    public ResponseEntity<Void> deleteAvatar(@PathVariable Long userId) {
        profilService.deleteAvatar(userId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/stagiaires/all")
    @PreAuthorize("hasAnyRole('ENCADRANT', 'ADMINISTRATEUR')")
    public ResponseEntity<List<StagiaireInfo>> getAllStagiaires() {
        return ResponseEntity.ok(profilService.getAllStagiaires());
    }

    @GetMapping("/stagiaires/{userId}")
    @PreAuthorize("hasAnyRole('STAGIAIRE', 'ENCADRANT', 'ADMINISTRATEUR')")
    public ResponseEntity<StagiaireInfo> getStagiaireInfo(@PathVariable Long userId) {
        return ResponseEntity.ok(profilService.getStagiaireInfo(userId));
    }
}