package com.engagement.tm.controller;

import com.engagement.tm.dto.EvaluationRequest;
import com.engagement.tm.dto.EvaluationResponse;
import com.engagement.tm.service.interfaces.EvaluationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/evaluations")
@RequiredArgsConstructor
@Slf4j
public class EvaluationController {

    private final EvaluationService evaluationService;

    @PostMapping("/equipes/{equipeId}/taches/{tacheId}")
    @PreAuthorize("hasRole('ENCADRANT')")
    public ResponseEntity<EvaluationResponse> evaluerTache(
            @PathVariable Long equipeId,
            @PathVariable Long tacheId,
            @RequestParam Long encadrantId,
            @Valid @RequestBody EvaluationRequest request) {
        return ResponseEntity.ok(evaluationService.evaluerTache(equipeId, tacheId, encadrantId, request));
    }

    @GetMapping("/equipes/{equipeId}/taches/{tacheId}")
    @PreAuthorize("hasRole('STAGIAIRE') or hasRole('ENCADRANT')")
    public ResponseEntity<EvaluationResponse> getEvaluation(
            @PathVariable Long equipeId,
            @PathVariable Long tacheId) {
        EvaluationResponse response = evaluationService.getEvaluationByTache(equipeId, tacheId);
        if (response == null) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(response);
    }

    // Nouvel endpoint pour récupérer toutes les évaluations d'une tâche
    @GetMapping("/equipes/{equipeId}/taches/{tacheId}/all")
    @PreAuthorize("hasRole('ENCADRANT')")
    public ResponseEntity<List<EvaluationResponse>> getAllEvaluations(
            @PathVariable Long equipeId,
            @PathVariable Long tacheId) {
        return ResponseEntity.ok(evaluationService.getAllEvaluationsByTache(equipeId, tacheId));
    }
}