package com.engagement.tm.controller;

import com.engagement.tm.dto.BacklogTacheResponse;
import com.engagement.tm.service.interfaces.TacheAssignmentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/taches")
@RequiredArgsConstructor
@Slf4j
public class TacheAssignmentController {

    private final TacheAssignmentService tacheAssignmentService;

    @PostMapping("/equipes/{equipeId}/{tacheId}/assigner")
    @PreAuthorize("hasRole('STAGIAIRE')")
    public ResponseEntity<BacklogTacheResponse> sAutoAssigner(
            @PathVariable Long equipeId,
            @PathVariable Long tacheId,
            @RequestParam Long stagiaireId) {
        return ResponseEntity.ok(tacheAssignmentService.sAutoAssignerTache(equipeId, tacheId, stagiaireId));
    }

    @DeleteMapping("/equipes/{equipeId}/{tacheId}/assigner")
    @PreAuthorize("hasRole('STAGIAIRE')")
    public ResponseEntity<BacklogTacheResponse> annulerAssignation(
            @PathVariable Long equipeId,
            @PathVariable Long tacheId,
            @RequestParam Long stagiaireId) {
        return ResponseEntity.ok(tacheAssignmentService.annulerAssignmentTache(equipeId, tacheId, stagiaireId));
    }

    @PostMapping("/equipes/{equipeId}/{tacheId}/demarrer")
    @PreAuthorize("hasRole('STAGIAIRE')")
    public ResponseEntity<BacklogTacheResponse> demarrerTache(
            @PathVariable Long equipeId,
            @PathVariable Long tacheId,
            @RequestParam Long stagiaireId) {
        return ResponseEntity.ok(tacheAssignmentService.demarrerTache(equipeId, tacheId, stagiaireId));
    }

    @PostMapping("/equipes/{equipeId}/{tacheId}/redemarrer")
    @PreAuthorize("hasRole('STAGIAIRE')")
    public ResponseEntity<BacklogTacheResponse> redemarrerTache(
            @PathVariable Long equipeId,
            @PathVariable Long tacheId,
            @RequestParam Long stagiaireId) {
        return ResponseEntity.ok(tacheAssignmentService.redemarrerTache(equipeId, tacheId, stagiaireId));
    }
}