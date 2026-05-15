package com.engagement.tm.controller;

import com.engagement.tm.dto.BacklogTacheRequest;
import com.engagement.tm.dto.BacklogTacheResponse;
import com.engagement.tm.entity.BacklogTache;
import com.engagement.tm.entity.StatutTache;
import com.engagement.tm.service.interfaces.BacklogTacheService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/backlog")
@RequiredArgsConstructor
@Slf4j
public class BacklogTacheController {

    private final BacklogTacheService backlogTacheService;

    /**
     * ➕ AJOUTER une tâche au backlog
     * POST /api/backlog/equipes/{equipeId}/taches?stagiaireId=...
     */
    @PostMapping("/equipes/{equipeId}/taches")
    @PreAuthorize("hasRole('STAGIAIRE')")
    public ResponseEntity<BacklogTacheResponse> ajouterTache(
            @PathVariable Long equipeId,
            @RequestParam Long stagiaireId,
            @Valid @RequestBody BacklogTacheRequest request) {
        log.info("➕ Ajout d'une tâche au backlog de l'équipe {} par le stagiaire {}", equipeId, stagiaireId);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(backlogTacheService.ajouterTache(equipeId, stagiaireId, request));
    }

    /**
     * ✏️ MODIFIER une tâche du backlog
     * PUT /api/backlog/equipes/{equipeId}/taches/{tacheId}?stagiaireId=...
     */
    @PutMapping("/equipes/{equipeId}/taches/{tacheId}")
    @PreAuthorize("hasRole('STAGIAIRE')")
    public ResponseEntity<BacklogTacheResponse> modifierTache(
            @PathVariable Long equipeId,
            @PathVariable Long tacheId,
            @RequestParam Long stagiaireId,
            @Valid @RequestBody BacklogTacheRequest request) {
        log.info("✏️ Modification de la tâche {} de l'équipe {} par le stagiaire {}", tacheId, equipeId, stagiaireId);
        return ResponseEntity.ok(backlogTacheService.modifierTache(equipeId, tacheId, stagiaireId, request));
    }

    /**
     * 🗑️ SUPPRIMER une tâche du backlog
     * DELETE /api/backlog/equipes/{equipeId}/taches/{tacheId}?stagiaireId=...
     */
    @DeleteMapping("/equipes/{equipeId}/taches/{tacheId}")
    @PreAuthorize("hasRole('STAGIAIRE')")
    public ResponseEntity<Void> supprimerTache(
            @PathVariable Long equipeId,
            @PathVariable Long tacheId,
            @RequestParam Long stagiaireId) {
        log.info("🗑️ Suppression de la tâche {} de l'équipe {} par le stagiaire {}", tacheId, equipeId, stagiaireId);
        backlogTacheService.supprimerTache(equipeId, tacheId, stagiaireId);
        return ResponseEntity.noContent().build();
    }

    /**
     * 👀 CONSULTER tout le backlog d'une équipe
     * GET /api/backlog/equipes/{equipeId}/taches
     */
    @GetMapping("/equipes/{equipeId}/taches")
    @PreAuthorize("hasRole('STAGIAIRE')")
    public ResponseEntity<List<BacklogTacheResponse>> consulterBacklog(@PathVariable Long equipeId) {
        log.info("👀 Consultation du backlog de l'équipe {}", equipeId);
        return ResponseEntity.ok(backlogTacheService.consulterBacklogParEquipe(equipeId));
    }

    /**
     * 👀 CONSULTER une tâche spécifique
     * GET /api/backlog/equipes/{equipeId}/taches/{tacheId}
     */
    @GetMapping("/equipes/{equipeId}/taches/{tacheId}")
    @PreAuthorize("hasRole('STAGIAIRE')")
    public ResponseEntity<BacklogTacheResponse> consulterTacheParId(
            @PathVariable Long equipeId,
            @PathVariable Long tacheId) {
        log.info("👀 Consultation de la tâche {} de l'équipe {}", tacheId, equipeId);
        return ResponseEntity.ok(backlogTacheService.consulterTacheParId(equipeId, tacheId));
    }

    @GetMapping("/equipes/{equipeId}/taches/statut/{statut}")
    @PreAuthorize("hasRole('STAGIAIRE')")
    public ResponseEntity<List<BacklogTacheResponse>> consulterParStatut(
            @PathVariable Long equipeId,
            @PathVariable StatutTache statut) {
        return ResponseEntity.ok(
                backlogTacheService.consulterParStatut(equipeId, statut));
    }

    @GetMapping("/taches/{tacheId}")
    @PreAuthorize("hasRole('ENCADRANT')")
    public ResponseEntity<BacklogTacheResponse> consulterTacheParIdEncadrant(@PathVariable Long tacheId) {
        log.info("👀 Consultation de la tâche {} par l'encadrant", tacheId);
        return ResponseEntity.ok(backlogTacheService.consulterTacheParIdEncadrant(tacheId));
    }

    @GetMapping("/encadrant/taches-a-evaluer")
    @PreAuthorize("hasRole('ENCADRANT')")
    public ResponseEntity<List<BacklogTacheResponse>> getTachesAEvaluer(@RequestParam Long encadrantId) {
        log.info("👀 Consultation des tâches à évaluer pour l'encadrant {}", encadrantId);
        return ResponseEntity.ok(backlogTacheService.consulterTachesAEvaluerParEncadrant(encadrantId));
    }
}
