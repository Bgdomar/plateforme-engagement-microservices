package com.engagement.tm.controller;

import com.engagement.tm.dto.StagiaireIdResponse;
import com.engagement.tm.repository.MembreEquipeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/stagiaires-equipes")
@RequiredArgsConstructor
@Slf4j
public class StagiaireEquipeController {

    private final MembreEquipeRepository membreEquipeRepository;

    /**
     * GET /api/stagiaires-equipes/affectes
     * Retourne la liste des IDs des stagiaires déjà affectés à une équipe
     * Accessible par ENCADRANT et ADMINISTRATEUR
     */
    @GetMapping("/affectes")
    @PreAuthorize("hasAnyRole('ENCADRANT', 'ADMINISTRATEUR')")
    public ResponseEntity<StagiaireIdResponse> getStagiairesAffectes() {
        List<Long> stagiaireIds = membreEquipeRepository.findAllStagiaireIdsAffectes();
        log.info("📋 {} stagiaires déjà affectés à des équipes", stagiaireIds.size());
        return ResponseEntity.ok(new StagiaireIdResponse(stagiaireIds));
    }
}