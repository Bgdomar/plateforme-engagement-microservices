// MissionController.java
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

    /**
     * Créer une mission
     ✅ Seul le STAGIAIRE peut créer ses propres missions
     */
    @PostMapping
    @PreAuthorize("hasRole('STAGIAIRE')")
    public ResponseEntity<MissionResponse> creerMission(@Valid @RequestBody MissionRequest request) {
        log.info("📝 Création d'une mission par le stagiaire");
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(missionService.creerMission(request));
    }

    /**
     * Modifier une mission
     ✅ Seul le STAGIAIRE peut modifier ses propres missions
     */
    @PutMapping("/{missionId}")
    @PreAuthorize("hasRole('STAGIAIRE')")
    public ResponseEntity<MissionResponse> modifierMission(
            @PathVariable Long missionId,
            @Valid @RequestBody MissionRequest request) {
        log.info("📝 Modification de la mission {} par le stagiaire", missionId);
        return ResponseEntity.ok(missionService.modifierMission(missionId, request));
    }

    /**
     * Supprimer une mission
     ✅ Seul le STAGIAIRE peut supprimer ses propres missions
     */
    @DeleteMapping("/{missionId}")
    @PreAuthorize("hasRole('STAGIAIRE')")
    public ResponseEntity<Void> supprimerMission(@PathVariable Long missionId) {
        log.info("🗑️ Suppression de la mission {} par le stagiaire", missionId);
        missionService.supprimerMission(missionId);
        return ResponseEntity.noContent().build();
    }

    /**
     * Démarrer une mission
     ✅ Seul le STAGIAIRE peut démarrer sa mission
     */
    @PostMapping("/{missionId}/demarrer")
    @PreAuthorize("hasRole('STAGIAIRE')")
    public ResponseEntity<MissionResponse> demarrerMission(
            @PathVariable Long missionId,
            @RequestParam Long stagiaireId) {
        log.info("🚀 Démarrage de la mission {} par le stagiaire {}", missionId, stagiaireId);
        return ResponseEntity.ok(missionService.demarrerMission(missionId, stagiaireId));
    }

    /**
     * Terminer une mission
     ✅ Seul le STAGIAIRE peut terminer sa mission
     */
    @PostMapping("/{missionId}/terminer")
    @PreAuthorize("hasRole('STAGIAIRE')")
    public ResponseEntity<MissionResponse> terminerMission(
            @PathVariable Long missionId,
            @RequestParam Long stagiaireId) {
        log.info("🏁 Terminer la mission {} par le stagiaire {}", missionId, stagiaireId);
        return ResponseEntity.ok(missionService.terminerMission(missionId, stagiaireId));
    }

    /**
     * Annuler une mission
     ✅ Seul le STAGIAIRE peut annuler sa mission
     */
    @PostMapping("/{missionId}/annuler")
    @PreAuthorize("hasRole('STAGIAIRE')")
    public ResponseEntity<MissionResponse> annulerMission(
            @PathVariable Long missionId,
            @RequestParam Long stagiaireId) {
        log.info("❌ Annulation de la mission {} par le stagiaire {}", missionId, stagiaireId);
        return ResponseEntity.ok(missionService.annulerMission(missionId, stagiaireId));
    }

    // ========== CONSULTATION ==========

    /**
     * Consulter une mission par son ID
     ✅ STAGIAIRE (ses propres missions) ou ENCADRANT (pour suivi)
     */
    @GetMapping("/{missionId}")
    @PreAuthorize("hasAnyRole('ENCADRANT', 'STAGIAIRE', 'ADMINISTRATEUR')")
    public ResponseEntity<MissionResponse> consulterMissionParId(@PathVariable Long missionId) {
        log.info("📋 Consultation de la mission {}", missionId);
        return ResponseEntity.ok(missionService.consulterMissionParId(missionId));
    }

    /**
     * Consulter ses propres missions (pour le stagiaire connecté)
     ✅ STAGIAIRE consulte ses missions
     */
    @GetMapping("/mes-missions")
    @PreAuthorize("hasRole('STAGIAIRE')")
    public ResponseEntity<List<MissionResponse>> consulterMesMissions(@RequestParam Long stagiaireId) {
        log.info("📋 Consultation de mes missions pour le stagiaire {}", stagiaireId);
        return ResponseEntity.ok(missionService.consulterMissionsParStagiaire(stagiaireId));
    }

    /**
     * Consulter toutes les missions d'un stagiaire (pour suivi par encadrant)
     ✅ ENCADRANT ou ADMIN peuvent suivre l'engagement
     */
    @GetMapping("/stagiaire/{stagiaireId}")
    @PreAuthorize("hasAnyRole('ENCADRANT', 'ADMINISTRATEUR')")
    public ResponseEntity<List<MissionResponse>> consulterMissionsParStagiaire(@PathVariable Long stagiaireId) {
        log.info("📋 Consultation des missions pour le stagiaire {} (suivi encadrant)", stagiaireId);
        return ResponseEntity.ok(missionService.consulterMissionsParStagiaire(stagiaireId));
    }

    /**
     * Consulter toutes les missions d'une équipe (pour suivi par encadrant)
     ✅ ENCADRANT ou ADMIN peuvent suivre l'engagement
     */
    @GetMapping("/equipe/{equipeId}")
    @PreAuthorize("hasAnyRole('ENCADRANT', 'ADMINISTRATEUR')")
    public ResponseEntity<List<MissionResponse>> consulterMissionsParEquipe(@PathVariable Long equipeId) {
        log.info("📋 Consultation des missions pour l'équipe {} (suivi encadrant)", equipeId);
        return ResponseEntity.ok(missionService.consulterMissionsParEquipe(equipeId));
    }
}