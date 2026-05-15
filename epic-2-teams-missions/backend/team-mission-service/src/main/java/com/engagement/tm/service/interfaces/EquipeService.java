package com.engagement.tm.service.interfaces;

import com.engagement.tm.dto.EquipeResponse;

import java.util.List;

public interface EquipeService {

    // UNIQUEMENT POUR L'INSCRIPTION AUTOMATIQUE
    EquipeResponse inscrireStagiaire(Long sujetId, Long stagiaireId);

    // POUR LA CONSULTATION (encadrant)
    List<EquipeResponse> consulterEquipesParEncadrant(Long encadrantId);

    // POUR LA CONSULTATION (stagiaire)
    List<EquipeResponse> consulterEquipesParStagiaire(Long stagiaireId);

    // DÉTAIL D'UNE ÉQUIPE
    EquipeResponse consulterEquipeParId(Long equipeId);
}