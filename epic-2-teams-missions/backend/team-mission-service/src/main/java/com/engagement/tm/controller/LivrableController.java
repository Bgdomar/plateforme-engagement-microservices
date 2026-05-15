package com.engagement.tm.controller;

import com.engagement.tm.dto.LivrableRequest;
import com.engagement.tm.dto.LivrableResponse;
import com.engagement.tm.service.interfaces.LivrableService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/livrables")
@RequiredArgsConstructor
@Slf4j
public class LivrableController {

    private final LivrableService livrableService;

    @PostMapping("/equipes/{equipeId}/taches/{tacheId}")
    @PreAuthorize("hasRole('STAGIAIRE')")
    public ResponseEntity<LivrableResponse> soumettreLivrable(
            @PathVariable Long equipeId,
            @PathVariable Long tacheId,
            @RequestParam Long stagiaireId,
            @RequestParam(required = false) MultipartFile fichier,
            @RequestParam(required = false) String lienURL,
            @RequestParam(required = false) String description) {

        log.info("📤 Soumission livrable - equipeId: {}, tacheId: {}, fichier: {}, lienURL: {}",
                equipeId, tacheId, fichier != null ? fichier.getOriginalFilename() : "null", lienURL);

        LivrableRequest request = new LivrableRequest();
        request.setLienURL(lienURL);
        request.setDescription(description);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(livrableService.soumettreLivrable(equipeId, tacheId, stagiaireId, request, fichier));
    }

    @GetMapping("/equipes/{equipeId}/taches/{tacheId}")
    @PreAuthorize("hasRole('STAGIAIRE') or hasRole('ENCADRANT')")
    public ResponseEntity<List<LivrableResponse>> getLivrables(
            @PathVariable Long equipeId,
            @PathVariable Long tacheId) {
        return ResponseEntity.ok(livrableService.getLivrablesByTache(equipeId, tacheId));
    }

    @GetMapping("/equipes/{equipeId}/taches/{tacheId}/dernier")
    @PreAuthorize("hasRole('STAGIAIRE') or hasRole('ENCADRANT')")
    public ResponseEntity<LivrableResponse> getDernierLivrable(
            @PathVariable Long equipeId,
            @PathVariable Long tacheId) {
        LivrableResponse response = livrableService.getDernierLivrable(equipeId, tacheId);
        if (response == null) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(response);
    }

    // Nouvel endpoint pour télécharger un fichier livrable
    @GetMapping("/download/{fileName}")
    @PreAuthorize("hasRole('STAGIAIRE') or hasRole('ENCADRANT')")
    public ResponseEntity<byte[]> telechargerFichier(@PathVariable String fileName) {
        byte[] fileContent = livrableService.telechargerFichier(fileName);

        // Déterminer le type MIME
        MediaType mediaType = getMediaType(fileName);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileName + "\"")
                .contentType(mediaType)
                .body(fileContent);
    }

    private MediaType getMediaType(String fileName) {
        if (fileName.endsWith(".pdf")) return MediaType.APPLICATION_PDF;
        if (fileName.endsWith(".zip")) return MediaType.APPLICATION_OCTET_STREAM;
        if (fileName.endsWith(".png")) return MediaType.IMAGE_PNG;
        if (fileName.endsWith(".jpg") || fileName.endsWith(".jpeg")) return MediaType.IMAGE_JPEG;
        if (fileName.endsWith(".docx")) return MediaType.APPLICATION_OCTET_STREAM;
        return MediaType.APPLICATION_OCTET_STREAM;
    }
}