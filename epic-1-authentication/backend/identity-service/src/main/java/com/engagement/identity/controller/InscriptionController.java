package com.engagement.identity.controller;

import com.engagement.identity.dto.DemandeInscriptionRequest;
import com.engagement.identity.dto.InscriptionResponse;
import com.engagement.identity.service.interfaces.InscriptionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/inscriptions")
@RequiredArgsConstructor
public class InscriptionController {

    private final InscriptionService inscriptionService;

    @PostMapping(value = "/demandes", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<InscriptionResponse> soumettreDemande(
            @RequestPart("data") @Valid DemandeInscriptionRequest request,
            @RequestPart(value = "photo", required = false) MultipartFile photo,
            @RequestPart(value = "profileImage", required = false) MultipartFile profileImage
    ) {
        return ResponseEntity.ok(inscriptionService.soumettreDemande(request, photo, profileImage));
    }

    @PostMapping(value = "/demandes-simple", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> soumettreDemandeSimple(@RequestBody @Valid DemandeInscriptionRequest request) {
        try {
            return ResponseEntity.ok(inscriptionService.soumettreDemande(request, null, null));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }
}
