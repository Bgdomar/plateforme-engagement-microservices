package com.engagement.identity.controller;

import com.engagement.identity.dto.DemandeInscriptionResponse;
import com.engagement.identity.dto.TraiterDemandeRequest;
import com.engagement.identity.entity.enums.StatutDemande;
import com.engagement.identity.service.interfaces.DemandeInscriptionService;
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

    @GetMapping
    @PreAuthorize("hasRole('ADMINISTRATEUR')")
    public ResponseEntity<List<DemandeInscriptionResponse>> listerDemandes(
            @RequestParam(required = false) StatutDemande statut) {
        return ResponseEntity.ok(demandeService.listerDemandes(statut));
    }

    @PatchMapping("/{id}/traiter")
    @PreAuthorize("hasRole('ADMINISTRATEUR')")
    public ResponseEntity<DemandeInscriptionResponse> traiterDemande(
            @PathVariable UUID id,
            @Valid @RequestBody TraiterDemandeRequest request) {
        return ResponseEntity.ok(demandeService.traiterDemande(id, request));
    }
}
