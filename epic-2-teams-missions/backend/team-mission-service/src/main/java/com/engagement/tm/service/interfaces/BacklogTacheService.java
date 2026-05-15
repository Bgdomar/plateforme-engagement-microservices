package com.engagement.tm.service.interfaces;

import com.engagement.tm.dto.BacklogTacheRequest;
import com.engagement.tm.dto.BacklogTacheResponse;
import com.engagement.tm.entity.BacklogTache;
import com.engagement.tm.entity.StatutTache;

import java.util.List;

public interface BacklogTacheService {

    /**
     * ➕ Ajouter une tâche au backlog de l'équipe
     */
    BacklogTacheResponse ajouterTache(Long equipeId, Long stagiaireId, BacklogTacheRequest request);

    /**
     * ✏️ Modifier une tâche du backlog
     */
    BacklogTacheResponse modifierTache(Long equipeId, Long tacheId, Long stagiaireId, BacklogTacheRequest request);

    /**
     * 🗑️ Supprimer une tâche du backlog
     */
    void supprimerTache(Long equipeId, Long tacheId, Long stagiaireId);

    /**
     * 👀 Consulter toutes les tâches du backlog d'une équipe
     */
    List<BacklogTacheResponse> consulterBacklogParEquipe(Long equipeId);

    /**
     * 👀 Consulter une tâche spécifique
     */
    BacklogTacheResponse consulterTacheParId(Long equipeId, Long tacheId);

    List<BacklogTacheResponse> consulterParStatut(Long equipeId, StatutTache statut);

    BacklogTacheResponse consulterTacheParIdEncadrant(Long tacheId);

    List<BacklogTacheResponse> consulterTachesAEvaluerParEncadrant(Long encadrantId);
}