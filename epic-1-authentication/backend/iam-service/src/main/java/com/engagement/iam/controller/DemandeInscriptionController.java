package com.engagement.iam.controller;

import com.engagement.iam.dto.*;
import com.engagement.iam.entity.enums.StatutDemande;
import com.engagement.iam.service.implimentaion.DemandeInscriptionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

import java.util.List;

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
            @PathVariable Long id,
            @Valid @RequestBody TraiterDemandeRequest request) {

        return ResponseEntity.ok(demandeService.traiterDemande(id, request));
    }

    /**
     * GET /api/admin/users
     * Retourne la liste de tous les utilisateurs (stagiaires et encadrants)
     */
    @GetMapping("/users")
    public ResponseEntity<List<UserInfoResponse>> getAllUsers() {
        return ResponseEntity.ok(demandeService.getAllUsers());
    }

    /**
     * PATCH /api/admin/users/{userId}/statut
     * Modifie le statut d'un compte (ACTIF, SUSPENDU, DESACTIVE)
     */
    @PatchMapping("/users/{userId}/statut")
    public ResponseEntity<UserInfoResponse> updateUserStatut(
            @PathVariable Long userId,
            @Valid @RequestBody UpdateStatutRequest request) {
        return ResponseEntity.ok(demandeService.updateUserStatut(userId, request));
    }

    /**
     * PATCH /api/admin/users/{userId}/stage-dates
     * Modifie les dates de stage d'un stagiaire existant
     */
    @PatchMapping("/users/{userId}/stage-dates")
    public ResponseEntity<UserInfoResponse> updateStageDates(
            @PathVariable Long userId,
            @Valid @RequestBody UpdateStageDatesRequest request) {
        return ResponseEntity.ok(demandeService.updateStageDates(userId, request));
    }

    /**
     * DELETE /api/admin/inscriptions
     * Supprime plusieurs demandes (uniquement celles qui ne sont pas en attente)
     */
    @DeleteMapping
    public ResponseEntity<DeleteDemandesResponse> supprimerDemandes(
            @Valid @RequestBody DeleteDemandesRequest request) {
        return ResponseEntity.ok(demandeService.supprimerDemandes(request.getDemandeIds()));
    }
}