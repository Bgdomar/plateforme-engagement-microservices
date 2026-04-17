package com.engagement.iam.controller;

import com.engagement.iam.dto.DemandeInscriptionRequest;
import com.engagement.iam.dto.InscriptionResponse;
import com.engagement.iam.service.interfaces.InscriptionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/inscriptions")
@RequiredArgsConstructor
@Slf4j
// FIX #5 : @CrossOrigin supprimé — le CORS est déjà géré globalement dans WebConfig.java
// Le garder ici en doublon peut créer des conflits de headers en production
public class InscriptionController {

    private final InscriptionService inscriptionService;

    @PostMapping(
            value = "/demandes",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<InscriptionResponse> soumettreDemande(
            @RequestPart("data") @Valid DemandeInscriptionRequest request,
            @RequestPart(value = "profileImage", required = false) MultipartFile profileImage
    ) {
        log.info("📥 Nouvelle demande inscription : {} {}", request.getPrenom(), request.getNom());

        InscriptionResponse response =
                inscriptionService.soumettreDemande(request, profileImage);

        return ResponseEntity.ok(response);
    }
}