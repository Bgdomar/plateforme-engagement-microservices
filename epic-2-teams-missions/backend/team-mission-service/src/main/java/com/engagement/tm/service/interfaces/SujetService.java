package com.engagement.tm.service.interfaces;

import com.engagement.tm.dto.SujetRequest;
import com.engagement.tm.dto.SujetResponse;
import com.engagement.tm.entity.StatutSujet;

import java.util.List;

public interface SujetService {

    /**
     * Publier un nouveau sujet (statut = OUVERT par défaut)
     */
    SujetResponse creerSujet(SujetRequest request);

    /**
     * Modifier un sujet existant
     */
    SujetResponse modifierSujet(Long sujetId, SujetRequest request);

    /**
     * Supprimer un sujet
     */
    void supprimerSujet(Long sujetId, Long encadrantId);

    /**
     * Changer le statut d'un sujet (OUVERT ↔ FERMÉ)
     */
    SujetResponse changerStatut(Long sujetId, Long encadrantId, StatutSujet nouveauStatut);

    /**
     * Consulter tous les sujets d'un encadrant
     */
    List<SujetResponse> consulterSujetsParEncadrant(Long encadrantId);

    /**
     * Consulter un sujet par son ID
     */
    SujetResponse consulterSujetParId(Long sujetId);

    /**
     * Consulter tous les sujets OUVERTs (pour les stagiaires)
     */
    List<SujetResponse> consulterSujetsOuverts();
}