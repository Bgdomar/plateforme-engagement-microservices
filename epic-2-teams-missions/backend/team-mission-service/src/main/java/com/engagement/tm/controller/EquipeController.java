package com.engagement.tm.controller;

import com.engagement.tm.dto.AjouterMembreRequest;
import com.engagement.tm.dto.EquipeRequest;
import com.engagement.tm.dto.EquipeResponse;
import com.engagement.tm.dto.MembreEquipeResponse;
import com.engagement.tm.service.interfaces.EquipeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/equipes")
@RequiredArgsConstructor
@Slf4j
public class EquipeController {

    private final EquipeService equipeService;  // Injection de l'interface

    @PostMapping
    @PreAuthorize("hasRole('ENCADRANT')")
    public ResponseEntity<EquipeResponse> creerEquipe(@Valid @RequestBody EquipeRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(equipeService.creerEquipe(request));
    }

    @PostMapping("/{equipeId}/membres")
    @PreAuthorize("hasRole('ENCADRANT')")
    public ResponseEntity<MembreEquipeResponse> ajouterMembre(
            @PathVariable Long equipeId,
            @Valid @RequestBody AjouterMembreRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(equipeService.ajouterMembre(equipeId, request));
    }

    @DeleteMapping("/{equipeId}/membres/{stagiaireId}")
    @PreAuthorize("hasRole('ENCADRANT')")
    public ResponseEntity<Void> supprimerMembre(
            @PathVariable Long equipeId,
            @PathVariable Long stagiaireId) {
        equipeService.supprimerMembre(equipeId, stagiaireId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{equipeId}")
    @PreAuthorize("hasRole('ENCADRANT')")
    public ResponseEntity<Void> supprimerEquipe(@PathVariable Long equipeId) {
        equipeService.supprimerEquipe(equipeId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/encadrant/{encadrantId}")
    @PreAuthorize("hasRole('ENCADRANT')")
    public ResponseEntity<List<EquipeResponse>> consulterEquipesParEncadrant(@PathVariable Long encadrantId) {
        return ResponseEntity.ok(equipeService.consulterEquipesParEncadrant(encadrantId));
    }

    @GetMapping("/{equipeId}")
    @PreAuthorize("hasAnyRole('ENCADRANT', 'STAGIAIRE')")
    public ResponseEntity<EquipeResponse> consulterEquipeParId(@PathVariable Long equipeId) {
        return ResponseEntity.ok(equipeService.consulterEquipeParId(equipeId));
    }

    @GetMapping("/stagiaire/{stagiaireId}")
    @PreAuthorize("hasRole('STAGIAIRE')")
    public ResponseEntity<List<EquipeResponse>> consulterEquipesParStagiaire(@PathVariable Long stagiaireId) {
        return ResponseEntity.ok(equipeService.consulterEquipesParStagiaire(stagiaireId));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMINISTRATEUR')")
    public ResponseEntity<List<EquipeResponse>> consulterToutesLesEquipes() {
        return ResponseEntity.ok(equipeService.consulterToutesLesEquipes());
    }
}