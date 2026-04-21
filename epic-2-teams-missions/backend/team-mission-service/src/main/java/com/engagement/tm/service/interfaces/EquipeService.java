package com.engagement.tm.service.interfaces;

import com.engagement.tm.dto.AjouterMembreRequest;
import com.engagement.tm.dto.EquipeRequest;
import com.engagement.tm.dto.EquipeResponse;
import com.engagement.tm.dto.MembreEquipeResponse;

import java.util.List;

public interface EquipeService {

    EquipeResponse creerEquipe(EquipeRequest request);

    MembreEquipeResponse ajouterMembre(Long equipeId, AjouterMembreRequest request);

    void supprimerMembre(Long equipeId, Long stagiaireId);

    void supprimerEquipe(Long equipeId);

    List<EquipeResponse> consulterEquipesParEncadrant(Long encadrantId);

    EquipeResponse consulterEquipeParId(Long equipeId);

    List<EquipeResponse> consulterEquipesParStagiaire(Long stagiaireId);

    List<EquipeResponse> consulterToutesLesEquipes();

    EquipeResponse updateEquipe(Long equipeId, EquipeRequest request);
}