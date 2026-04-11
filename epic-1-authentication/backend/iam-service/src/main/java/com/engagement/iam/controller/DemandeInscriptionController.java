package com.engagement.iam.controller;

import com.engagement.iam.dto.DemandeInscriptionResponse;
import com.engagement.iam.dto.TraiterDemandeRequest;
import com.engagement.iam.entity.enums.StatutDemande;
import com.engagement.iam.service.implimentaion.DemandeInscriptionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/inscriptions")
@RequiredArgsConstructor
public class DemandeInscriptionController {

    private final DemandeInscriptionService demandeService;

    /**
     * GET /api/admin/inscriptions?statut=EN_ATTENTE
     * Retourne toutes les demandes, filtrables par statut
     */
    @GetMapping
    public ResponseEntity<List<DemandeInscriptionResponse>> listerDemandes(
            @RequestParam(required = false) StatutDemande statut) {

        return ResponseEntity.ok(demandeService.listerDemandes(statut));
    }

    /**
     * PATCH /api/admin/inscriptions/{id}/traiter
     * Body : { "decision": "VALIDEE" | "REJETER", "commentaire": "..." }
     */
    @PatchMapping("/{id}/traiter")
    public ResponseEntity<DemandeInscriptionResponse> traiterDemande(
            @PathVariable UUID id,
            @Valid @RequestBody TraiterDemandeRequest request) {

        return ResponseEntity.ok(demandeService.traiterDemande(id, request));
    }
}