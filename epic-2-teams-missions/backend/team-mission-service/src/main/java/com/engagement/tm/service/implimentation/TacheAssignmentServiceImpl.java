package com.engagement.tm.service.implimentation;

import com.engagement.tm.dto.BacklogTacheResponse;
import com.engagement.tm.entity.BacklogTache;
import com.engagement.tm.entity.StatutTache;
import com.engagement.tm.repository.BacklogTacheRepository;
import com.engagement.tm.repository.MembreEquipeRepository;
import com.engagement.tm.service.interfaces.TacheAssignmentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
@Slf4j
public class TacheAssignmentServiceImpl implements TacheAssignmentService {

    private final BacklogTacheRepository backlogTacheRepository;
    private final MembreEquipeRepository membreEquipeRepository;

    private void verifierMembreEquipe(Long equipeId, Long stagiaireId) {
        if (!membreEquipeRepository.existsByEquipeIdAndStagiaireId(equipeId, stagiaireId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Vous n'êtes pas membre de cette équipe");
        }
    }

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
    public BacklogTacheResponse sAutoAssignerTache(Long equipeId, Long tacheId, Long stagiaireId) {
        log.info("📌 Auto-assignation de la tâche {} par stagiaire {}", tacheId, stagiaireId);

        verifierMembreEquipe(equipeId, stagiaireId);
        BacklogTache tache = verifierTacheExiste(equipeId, tacheId);

        // Vérifier que la tâche est disponible pour assignation
        if (tache.getStatut() != StatutTache.A_FAIRE) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Cette tâche n'est pas disponible pour assignation (statut actuel: " + tache.getStatut() + ")");
        }

        // Vérifier que la tâche n'est pas déjà assignée
        if (tache.getAssigneId() != null) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Cette tâche est déjà assignée à un autre stagiaire");
        }

        tache.setAssigneId(stagiaireId);
        tache.setStatut(StatutTache.ASSIGNEE);
        tache = backlogTacheRepository.save(tache);

        log.info("✅ Tâche {} assignée au stagiaire {}", tacheId, stagiaireId);
        return toResponse(tache);
    }

    @Override
    @Transactional
    public BacklogTacheResponse annulerAssignmentTache(Long equipeId, Long tacheId, Long stagiaireId) {
        log.info("❌ Annulation de l'assignation de la tâche {} par stagiaire {}", tacheId, stagiaireId);

        verifierMembreEquipe(equipeId, stagiaireId);
        BacklogTache tache = verifierTacheExiste(equipeId, tacheId);

        if (tache.getAssigneId() == null || !tache.getAssigneId().equals(stagiaireId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "Vous n'êtes pas assigné à cette tâche");
        }

        // Vérifier que la tâche n'a pas été démarrée
        if (tache.getStatut() != StatutTache.ASSIGNEE) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Impossible d'annuler l'assignation : la tâche a déjà été démarrée (statut: " + tache.getStatut() + ")");
        }

        tache.setAssigneId(null);
        tache.setStatut(StatutTache.A_FAIRE);
        tache = backlogTacheRepository.save(tache);

        log.info("✅ Assignation de la tâche {} annulée", tacheId);
        return toResponse(tache);
    }

    @Override
    @Transactional
    public BacklogTacheResponse demarrerTache(Long equipeId, Long tacheId, Long stagiaireId) {
        log.info("🚀 Démarrage de la tâche {} par stagiaire {}", tacheId, stagiaireId);

        verifierMembreEquipe(equipeId, stagiaireId);
        BacklogTache tache = verifierTacheExiste(equipeId, tacheId);

        if (tache.getAssigneId() == null || !tache.getAssigneId().equals(stagiaireId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "Vous n'êtes pas assigné à cette tâche");
        }

        // Vérifier que la tâche est assignée
        if (tache.getStatut() != StatutTache.ASSIGNEE) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Impossible de démarrer la tâche (statut actuel: " + tache.getStatut() + ")");
        }

        tache.setStatut(StatutTache.DEMARREE);
        tache.setDateDebut(java.time.LocalDateTime.now());
        tache = backlogTacheRepository.save(tache);

        log.info("✅ Tâche {} démarrée par stagiaire {}", tacheId, stagiaireId);
        return toResponse(tache);
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
                .statut(tache.getStatut())
                .missionId(tache.getMissionId())
                .assigneId(tache.getAssigneId())
                .estimationJours(tache.getEstimationJours())
                .dateDebut(tache.getDateDebut())
                .dateCreation(tache.getDateCreation())
                .dateMiseAJour(tache.getDateMiseAJour())
                .build();
    }

    @Transactional
    @Override
    public BacklogTacheResponse redemarrerTache(Long equipeId, Long tacheId, Long stagiaireId) {
        log.info("🔄 Redémarrage de la tâche {} par stagiaire {}", tacheId, stagiaireId);

        verifierMembreEquipe(equipeId, stagiaireId);
        BacklogTache tache = verifierTacheExiste(equipeId, tacheId);

        // Seule une tâche REFAIRE peut être redémarrée
        if (tache.getStatut() != StatutTache.REFAIRE) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Seules les tâches REFAIRE peuvent être redémarrées (statut: " + tache.getStatut() + ")");
        }

        // Vérifier que c'est bien le bon stagiaire
        if (tache.getAssigneId() == null || !tache.getAssigneId().equals(stagiaireId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "Vous n'êtes pas assigné à cette tâche");
        }

        tache.setStatut(StatutTache.DEMARREE);
        tache.setDateDebut(java.time.LocalDateTime.now());
        tache = backlogTacheRepository.save(tache);

        log.info("✅ Tâche {} redémarrée par stagiaire {}", tacheId, stagiaireId);
        return toResponse(tache);
    }
}