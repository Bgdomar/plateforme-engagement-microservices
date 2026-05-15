package com.engagement.tm.controller;

import com.engagement.tm.dto.MissionRequest;
import com.engagement.tm.dto.MissionResponse;
import com.engagement.tm.service.interfaces.MissionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/missions")
@RequiredArgsConstructor
@Slf4j
public class MissionController {

    private final MissionService missionService;

    @PostMapping("/equipes/{equipeId}")
    @PreAuthorize("hasRole('STAGIAIRE')")
    public ResponseEntity<MissionResponse> creerMission(
            @PathVariable Long equipeId,
            @RequestParam Long stagiaireId,
            @Valid @RequestBody MissionRequest request) {
        log.info("📋 Création d'une mission pour l'équipe {}", equipeId);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(missionService.creerMission(equipeId, stagiaireId, request));
    }

    @PutMapping("/equipes/{equipeId}/{missionId}")
    @PreAuthorize("hasRole('STAGIAIRE')")
    public ResponseEntity<MissionResponse> modifierMission(
            @PathVariable Long equipeId,
            @PathVariable Long missionId,
            @RequestParam Long stagiaireId,
            @Valid @RequestBody MissionRequest request) {
        return ResponseEntity.ok(missionService.modifierMission(equipeId, missionId, stagiaireId, request));
    }

    @DeleteMapping("/equipes/{equipeId}/{missionId}")
    @PreAuthorize("hasRole('STAGIAIRE')")
    public ResponseEntity<Void> supprimerMission(
            @PathVariable Long equipeId,
            @PathVariable Long missionId,
            @RequestParam Long stagiaireId) {
        missionService.supprimerMission(equipeId, missionId, stagiaireId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/equipes/{equipeId}")
    @PreAuthorize("hasRole('STAGIAIRE')")
    public ResponseEntity<List<MissionResponse>> consulterMissions(@PathVariable Long equipeId) {
        return ResponseEntity.ok(missionService.consulterMissionsParEquipe(equipeId));
    }

    @GetMapping("/equipes/{equipeId}/{missionId}")
    @PreAuthorize("hasRole('STAGIAIRE')")
    public ResponseEntity<MissionResponse> consulterMissionParId(
            @PathVariable Long equipeId,
            @PathVariable Long missionId) {
        return ResponseEntity.ok(missionService.consulterMissionParId(equipeId, missionId));
    }

    @PostMapping("/equipes/{equipeId}/{missionId}/taches")
    @PreAuthorize("hasRole('STAGIAIRE')")
    public ResponseEntity<MissionResponse> ajouterTachesMission(
            @PathVariable Long equipeId,
            @PathVariable Long missionId,
            @RequestParam Long stagiaireId,
            @RequestBody List<Long> tacheIds) {
        return ResponseEntity.ok(missionService.ajouterTachesMission(equipeId, missionId, stagiaireId, tacheIds));
    }

    /** DELETE /api/missions/equipes/{equipeId}/{missionId}/taches/{tacheId}?stagiaireId=... */
    @DeleteMapping("/equipes/{equipeId}/{missionId}/taches/{tacheId}")
    @PreAuthorize("hasRole('STAGIAIRE')")
    public ResponseEntity<MissionResponse> retirerTache(
            @PathVariable Long equipeId,
            @PathVariable Long missionId,
            @PathVariable Long tacheId,
            @RequestParam Long stagiaireId) {

        MissionResponse response = missionService.retirerTacheMission(equipeId, missionId, tacheId, stagiaireId);

        // Si null → la mission a été supprimée (dernière tâche retirée)
        if (response == null) {
            return ResponseEntity.noContent().build(); // 204
        }
        return ResponseEntity.ok(response); // 200
    }
}