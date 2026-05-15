package com.engagement.tm.controller;

import com.engagement.tm.dto.SujetRequest;
import com.engagement.tm.dto.SujetResponse;
import com.engagement.tm.entity.StatutSujet;
import com.engagement.tm.service.interfaces.SujetService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sujets")
@RequiredArgsConstructor
@Slf4j
public class SujetController {

    private final SujetService sujetService;

    /**
     * 📝 PUBLIER un sujet (Encadrant uniquement)
     * POST /api/sujets
     * Le statut est automatiquement OUVERT
     */
    @PostMapping
    @PreAuthorize("hasRole('ENCADRANT')")
    public ResponseEntity<SujetResponse> creerSujet(@Valid @RequestBody SujetRequest request) {
        log.info("📝 Demande de création de sujet: {} par l'encadrant {}",
                request.getTitre(), request.getEncadrantId());
        return ResponseEntity.status(HttpStatus.CREATED).body(sujetService.creerSujet(request));
    }

    /**
     * ✏️ MODIFIER un sujet (Encadrant propriétaire uniquement)
     * PUT /api/sujets/{id}
     */
    @PutMapping("/{sujetId}")
    @PreAuthorize("hasRole('ENCADRANT')")
    public ResponseEntity<SujetResponse> modifierSujet(
            @PathVariable Long sujetId,
            @Valid @RequestBody SujetRequest request) {
        log.info("✏️ Demande de modification du sujet {} par l'encadrant {}",
                sujetId, request.getEncadrantId());

        // ✅ La vérification que l'encadrant est propriétaire se fait dans le service
        return ResponseEntity.ok(sujetService.modifierSujet(sujetId, request));
    }

    /**
     * 🗑️ SUPPRIMER un sujet (Encadrant propriétaire uniquement)
     * DELETE /api/sujets/{id}
     */
    @DeleteMapping("/{sujetId}")
    @PreAuthorize("hasRole('ENCADRANT')")
    public ResponseEntity<Void> supprimerSujet(
            @PathVariable Long sujetId,
            @RequestParam Long encadrantId) {  // ✅ On reçoit l'ID du frontend
        log.info("🗑️ Demande de suppression du sujet {} par l'encadrant {}", sujetId, encadrantId);

        sujetService.supprimerSujet(sujetId, encadrantId);

        return ResponseEntity.noContent().build();
    }

    /**
     * 🔄 CHANGER le statut d'un sujet (OUVERT ↔ FERMÉ)
     * PATCH /api/sujets/{id}/statut?statut=...&encadrantId=...
     */
    @PatchMapping("/{sujetId}/statut")
    @PreAuthorize("hasRole('ENCADRANT')")
    public ResponseEntity<SujetResponse> changerStatut(
            @PathVariable Long sujetId,
            @RequestParam StatutSujet statut,
            @RequestParam Long encadrantId) {  // ✅ On reçoit l'ID du frontend
        log.info("🔄 Demande de changement de statut du sujet {} vers {} par l'encadrant {}",
                sujetId, statut, encadrantId);

        return ResponseEntity.ok(sujetService.changerStatut(sujetId, encadrantId, statut));
    }

    /**
     * 📋 CONSULTER mes sujets (Encadrant connecté)
     * GET /api/sujets/encadrant/mes-sujets?encadrantId=...
     */
    @GetMapping("/encadrant/mes-sujets")
    @PreAuthorize("hasRole('ENCADRANT')")
    public ResponseEntity<List<SujetResponse>> consulterMesSujets(
            @RequestParam Long encadrantId) {  // ✅ On reçoit l'ID du frontend
        log.info("📋 Consultation des sujets de l'encadrant {}", encadrantId);

        return ResponseEntity.ok(sujetService.consulterSujetsParEncadrant(encadrantId));
    }

    /**
     * 📋 CONSULTER tous les sujets d'un encadrant (Admin uniquement)
     * GET /api/sujets/encadrant/{encadrantId}
     */
    @GetMapping("/encadrant/{encadrantId}")
    @PreAuthorize("hasRole('ADMINISTRATEUR')")
    public ResponseEntity<List<SujetResponse>> consulterSujetsParEncadrant(@PathVariable Long encadrantId) {
        log.info("📋 Consultation des sujets de l'encadrant {}", encadrantId);

        return ResponseEntity.ok(sujetService.consulterSujetsParEncadrant(encadrantId));
    }

    /**
     * 🔍 CONSULTER un sujet par son ID
     * GET /api/sujets/{id}
     */
    @GetMapping("/{sujetId}")
    @PreAuthorize("hasAnyRole('ENCADRANT', 'STAGIAIRE', 'ADMINISTRATEUR')")
    public ResponseEntity<SujetResponse> consulterSujetParId(@PathVariable Long sujetId) {
        log.info("🔍 Consultation du sujet {}", sujetId);

        return ResponseEntity.ok(sujetService.consulterSujetParId(sujetId));
    }

    /**
     * 📋 CONSULTER tous les sujets OUVERTs (pour les stagiaires)
     * GET /api/sujets/ouverts
     */
    @GetMapping("/ouverts")
    @PreAuthorize("hasAnyRole('STAGIAIRE', 'ENCADRANT', 'ADMINISTRATEUR')")
    public ResponseEntity<List<SujetResponse>> consulterSujetsOuverts() {
        log.info("📋 Consultation des sujets OUVERTs");

        return ResponseEntity.ok(sujetService.consulterSujetsOuverts());
    }
}