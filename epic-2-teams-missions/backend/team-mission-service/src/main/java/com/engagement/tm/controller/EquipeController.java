package com.engagement.tm.controller;

import com.engagement.tm.dto.EquipeResponse;
import com.engagement.tm.service.interfaces.EquipeService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/equipes")
@RequiredArgsConstructor
@Slf4j
public class EquipeController {

    private final EquipeService equipeService;

    /**
     * 🎯 INSCRIPTION AUTOMATIQUE (Stagiaire)
     */
    @PostMapping("/inscrire")
    @PreAuthorize("hasRole('STAGIAIRE')")
    public ResponseEntity<EquipeResponse> inscrireStagiaire(
            @RequestParam Long sujetId,
            @RequestParam Long stagiaireId) {
        log.info("🎯 Inscription du stagiaire {} au sujet {}", stagiaireId, sujetId);
        return ResponseEntity.ok(equipeService.inscrireStagiaire(sujetId, stagiaireId));
    }

    /**
     * 📋 CONSULTATION (Encadrant) - Voir les équipes de ses sujets
     */
    @GetMapping("/encadrant/{encadrantId}")
    @PreAuthorize("hasRole('ENCADRANT')")
    public ResponseEntity<List<EquipeResponse>> consulterEquipesParEncadrant(@PathVariable Long encadrantId) {
        log.info("📋 Consultation des équipes pour l'encadrant {}", encadrantId);
        return ResponseEntity.ok(equipeService.consulterEquipesParEncadrant(encadrantId));
    }

    /**
     * 📋 CONSULTATION (Stagiaire) - Voir son équipe
     */
    @GetMapping("/stagiaire/{stagiaireId}")
    @PreAuthorize("hasRole('STAGIAIRE')")
    public ResponseEntity<List<EquipeResponse>> consulterEquipesParStagiaire(@PathVariable Long stagiaireId) {
        log.info("📋 Consultation des équipes pour le stagiaire {}", stagiaireId);
        return ResponseEntity.ok(equipeService.consulterEquipesParStagiaire(stagiaireId));
    }

    /**
     * 📋 DÉTAIL d'une équipe
     */
    @GetMapping("/{equipeId}")
    @PreAuthorize("hasAnyRole('ENCADRANT', 'STAGIAIRE')")
    public ResponseEntity<EquipeResponse> consulterEquipeParId(@PathVariable Long equipeId) {
        log.info("📋 Consultation de l'équipe {}", equipeId);
        return ResponseEntity.ok(equipeService.consulterEquipeParId(equipeId));
    }
}