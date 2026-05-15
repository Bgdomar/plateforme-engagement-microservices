package com.engagement.tm.service.implimentation;

import com.engagement.tm.dto.BacklogTacheRequest;
import com.engagement.tm.dto.BacklogTacheResponse;
import com.engagement.tm.entity.*;
import com.engagement.tm.repository.BacklogTacheRepository;
import com.engagement.tm.repository.EquipeRepository;
import com.engagement.tm.repository.MembreEquipeRepository;
import com.engagement.tm.service.interfaces.BacklogTacheService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class BacklogTacheServiceImpl implements BacklogTacheService {

    private final BacklogTacheRepository backlogTacheRepository;
    private final EquipeRepository equipeRepository;
    private final MembreEquipeRepository membreEquipeRepository;

    // Méthode helper : vérifier qu'un stagiaire est membre de l'équipe
    private void verifierMembreEquipe(Long equipeId, Long stagiaireId) {
        if (!membreEquipeRepository.existsByEquipeIdAndStagiaireId(equipeId, stagiaireId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Vous n'êtes pas membre de cette équipe");
        }
    }

    // Méthode helper : vérifier que l'équipe existe
    private Equipe verifierEquipeExiste(Long equipeId) {
        return equipeRepository.findById(equipeId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Équipe introuvable"));
    }

    // Méthode helper : vérifier que la tâche existe et appartient à l'équipe
    private BacklogTache verifierTacheExiste(Long equipeId, Long tacheId) {
        BacklogTache tache = backlogTacheRepository.findById(tacheId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Tâche introuvable"));

        if (!tache.getEquipeId().equals(equipeId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Cette tâche n'appartient pas à votre équipe");
        }

        return tache;
    }

    @Override
    @Transactional
    public BacklogTacheResponse ajouterTache(Long equipeId, Long stagiaireId, BacklogTacheRequest request) {
        log.info("➕ Ajout d'une tâche au backlog de l'équipe {} par le stagiaire {}", equipeId, stagiaireId);

        // Vérifier que l'équipe existe
        verifierEquipeExiste(equipeId);

        // Vérifier que le stagiaire est membre de l'équipe
        verifierMembreEquipe(equipeId, stagiaireId);

        BacklogTache tache = BacklogTache.builder()
                .titre(request.getTitre())
                .description(request.getDescription())
                .niveau(request.getNiveau())
                .priorite(request.getPriorite())
                .equipeId(equipeId)
                .creeParId(stagiaireId)
                .statut(StatutTache.EN_ATTENTE)      // ← ajouter
                .estimationJours(request.getEstimationJours()) // ← ajouter
                .build();

        tache = backlogTacheRepository.save(tache);
        log.info("✅ Tâche '{}' ajoutée au backlog avec ID {}", tache.getTitre(), tache.getId());

        return toResponse(tache);
    }

    @Override
    @Transactional
    public BacklogTacheResponse modifierTache(Long equipeId, Long tacheId, Long stagiaireId, BacklogTacheRequest request) {
        log.info("✏️ Modification de la tâche {} de l'équipe {} par le stagiaire {}", tacheId, equipeId, stagiaireId);

        // Vérifier que l'équipe existe
        verifierEquipeExiste(equipeId);

        // Vérifier que le stagiaire est membre de l'équipe
        verifierMembreEquipe(equipeId, stagiaireId);

        // Vérifier que la tâche existe et appartient à l'équipe
        BacklogTache tache = verifierTacheExiste(equipeId, tacheId);

        if (tache.getStatut() != StatutTache.EN_ATTENTE) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Impossible de modifier une tâche déjà planifiée");
        }

        tache.setTitre(request.getTitre());
        tache.setDescription(request.getDescription());
        tache.setNiveau(request.getNiveau());
        tache.setPriorite(request.getPriorite());

        tache = backlogTacheRepository.save(tache);
        log.info("✅ Tâche {} modifiée", tacheId);

        return toResponse(tache);
    }

    @Override
    @Transactional
    public void supprimerTache(Long equipeId, Long tacheId, Long stagiaireId) {
        log.info("🗑️ Suppression de la tâche {} de l'équipe {} par le stagiaire {}", tacheId, equipeId, stagiaireId);

        // Vérifier que l'équipe existe
        verifierEquipeExiste(equipeId);

        // Vérifier que le stagiaire est membre de l'équipe
        verifierMembreEquipe(equipeId, stagiaireId);

        // Vérifier que la tâche existe et appartient à l'équipe
        verifierTacheExiste(equipeId, tacheId);

        // Vérifier que la tâche existe et appartient à l'équipe
        BacklogTache tache = verifierTacheExiste(equipeId, tacheId);

        if (tache.getStatut() != StatutTache.EN_ATTENTE) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Impossible de supprimer une tâche déjà planifiée");
        }

        backlogTacheRepository.deleteById(tacheId);
        log.info("✅ Tâche {} supprimée", tacheId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<BacklogTacheResponse> consulterBacklogParEquipe(Long equipeId) {
        log.info("👀 Consultation du backlog de l'équipe {}", equipeId);

        List<BacklogTache> taches = backlogTacheRepository.findByEquipeIdOrderByPrioriteDescDateCreationDesc(equipeId);
        return taches.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public BacklogTacheResponse consulterTacheParId(Long equipeId, Long tacheId) {
        log.info("👀 Consultation de la tâche {} de l'équipe {}", tacheId, equipeId);

        BacklogTache tache = verifierTacheExiste(equipeId, tacheId);
        return toResponse(tache);
    }

    @Override
    @Transactional(readOnly = true)
    public List<BacklogTacheResponse> consulterParStatut(Long equipeId, StatutTache statut) {
        log.info("👀 Consultation des tâches de l'équipe {} avec le statut {}", equipeId, statut);

        // Vérifier que l'équipe existe
        verifierEquipeExiste(equipeId);

        // Récupérer les tâches de l'équipe filtrées par statut
        List<BacklogTache> taches = backlogTacheRepository.findByEquipeIdAndStatutOrderByPrioriteDescDateCreationDesc(equipeId, statut);

        return taches.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }
    private BacklogTacheResponse toResponse(BacklogTache tache) {
        return BacklogTacheResponse.builder()
                .id(tache.getId())
                .titre(tache.getTitre())
                .description(tache.getDescription())
                .niveau(tache.getNiveau())
                .priorite(tache.getPriorite())
                .equipeId(tache.getEquipeId())
                .creeParId(tache.getCreeParId())
                .statut(tache.getStatut())                    // ← AJOUTER
                .missionId(tache.getMissionId())              // ← AJOUTER
                .assigneId(tache.getAssigneId())              // ← AJOUTER
                .estimationJours(tache.getEstimationJours())  // ← AJOUTER
                .dateDebut(tache.getDateDebut())              // ← AJOUTER
                .dateCreation(tache.getDateCreation())
                .dateMiseAJour(tache.getDateMiseAJour())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public BacklogTacheResponse consulterTacheParIdEncadrant(Long tacheId) {
        log.info("👀 Consultation de la tâche {} par l'encadrant", tacheId);
        BacklogTache tache = backlogTacheRepository.findById(tacheId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Tâche introuvable"));
        return toResponse(tache);
    }

    @Override
    @Transactional(readOnly = true)
    public List<BacklogTacheResponse> consulterTachesAEvaluerParEncadrant(Long encadrantId) {
        log.info("👀 Consultation des tâches à évaluer pour l'encadrant {}", encadrantId);

        // Récupérer toutes les équipes de l'encadrant
        List<Equipe> equipes = equipeRepository.findByEncadrantId(encadrantId);

        if (equipes.isEmpty()) {
            return Collections.emptyList();
        }

        List<Long> equipeIds = equipes.stream()
                .map(Equipe::getId)
                .collect(Collectors.toList());

        // Récupérer les tâches COMPLETEE de ces équipes
        List<BacklogTache> taches = backlogTacheRepository.findByEquipeIdInAndStatut(
                equipeIds, StatutTache.COMPLETEE);

        return taches.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }
}