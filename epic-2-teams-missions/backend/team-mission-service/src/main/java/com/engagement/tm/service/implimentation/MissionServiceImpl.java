package com.engagement.tm.service.implimentation;

import com.engagement.tm.dto.MissionRequest;
import com.engagement.tm.dto.MissionResponse;
import com.engagement.tm.dto.TacheMissionResponse;
import com.engagement.tm.entity.*;
import com.engagement.tm.repository.BacklogTacheRepository;
import com.engagement.tm.repository.EquipeRepository;
import com.engagement.tm.repository.MembreEquipeRepository;
import com.engagement.tm.repository.MissionRepository;
import com.engagement.tm.service.interfaces.MissionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class MissionServiceImpl implements MissionService {

    private final MissionRepository missionRepository;
    private final BacklogTacheRepository backlogTacheRepository;
    private final EquipeRepository equipeRepository;
    private final MembreEquipeRepository membreEquipeRepository;

    private void verifierMembreEquipe(Long equipeId, Long stagiaireId) {
        if (!membreEquipeRepository.existsByEquipeIdAndStagiaireId(equipeId, stagiaireId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Vous n'êtes pas membre de cette équipe");
        }
    }

    private Equipe verifierEquipeExiste(Long equipeId) {
        return equipeRepository.findById(equipeId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Équipe introuvable"));
    }

    private Mission verifierMissionExiste(Long equipeId, Long missionId) {
        Mission mission = missionRepository.findById(missionId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Mission introuvable"));

        if (!mission.getEquipeId().equals(equipeId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Cette mission n'appartient pas à votre équipe");
        }
        return mission;
    }

    @Override
    @Transactional
    public MissionResponse creerMission(Long equipeId, Long stagiaireId, MissionRequest request) {
        log.info("📋 Création d'une mission pour l'équipe {} par stagiaire {}", equipeId, stagiaireId);

        verifierEquipeExiste(equipeId);
        verifierMembreEquipe(equipeId, stagiaireId);

        // Créer la mission
        Mission mission = Mission.builder()
                .titre(request.getTitre())
                .description(request.getDescription())
                .deadline(request.getDeadline())
                .creeParId(stagiaireId)
                .equipeId(equipeId)
                .build();

        mission = missionRepository.save(mission);

        // Ajouter les tâches sélectionnées
        if (request.getTacheIds() != null && !request.getTacheIds().isEmpty()) {
            ajouterTachesAMission(mission, request.getTacheIds(), equipeId);
        }

        log.info("✅ Mission '{}' créée avec ID {}", mission.getTitre(), mission.getId());
        return toResponse(mission);
    }

    @Override
    @Transactional
    public MissionResponse modifierMission(Long equipeId, Long missionId, Long stagiaireId, MissionRequest request) {
        log.info("✏️ Modification de la mission {} de l'équipe {}", missionId, equipeId);

        verifierEquipeExiste(equipeId);
        verifierMembreEquipe(equipeId, stagiaireId);
        Mission mission = verifierMissionExiste(equipeId, missionId);

        mission.setTitre(request.getTitre());
        mission.setDescription(request.getDescription());
        mission.setDeadline(request.getDeadline());

        mission = missionRepository.save(mission);
        log.info("✅ Mission {} modifiée", missionId);

        return toResponse(mission);
    }

    @Override
    @Transactional
    public void supprimerMission(Long equipeId, Long missionId, Long stagiaireId) {
        log.info("🗑️ Suppression de la mission {} de l'équipe {}", missionId, equipeId);

        verifierEquipeExiste(equipeId);
        verifierMembreEquipe(equipeId, stagiaireId);
        Mission mission = verifierMissionExiste(equipeId, missionId);

        // ✅ Ajouter AVANT missionRepository.delete(mission)
        List<BacklogTache> taches = backlogTacheRepository.findByMissionId(missionId);
        boolean hasTacheDemarree = taches.stream().anyMatch(t ->
                t.getStatut() == StatutTache.DEMARREE ||
                        t.getStatut() == StatutTache.COMPLETEE ||
                        t.getStatut() == StatutTache.VALIDEE
        );
        if (hasTacheDemarree) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Impossible de supprimer cette mission : certaines tâches sont déjà démarrées ou complétées");
        }

        for (BacklogTache tache : taches) {
            tache.setMissionId(null);
            tache.setStatut(StatutTache.EN_ATTENTE);
            backlogTacheRepository.save(tache);
        }
        missionRepository.delete(mission);
        log.info("✅ Mission {} supprimée", missionId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<MissionResponse> consulterMissionsParEquipe(Long equipeId) {
        log.info("👀 Consultation des missions de l'équipe {}", equipeId);
        verifierEquipeExiste(equipeId);

        List<Mission> missions = missionRepository.findByEquipeId(equipeId);
        return missions.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public MissionResponse consulterMissionParId(Long equipeId, Long missionId) {
        log.info("👀 Consultation de la mission {} de l'équipe {}", missionId, equipeId);
        Mission mission = verifierMissionExiste(equipeId, missionId);
        return toResponse(mission);
    }

    @Override
    @Transactional
    public MissionResponse ajouterTachesMission(Long equipeId, Long missionId, Long stagiaireId, List<Long> tacheIds) {
        log.info("➕ Ajout de {} tâches à la mission {} de l'équipe {}", tacheIds.size(), missionId, equipeId);

        verifierEquipeExiste(equipeId);
        verifierMembreEquipe(equipeId, stagiaireId);
        Mission mission = verifierMissionExiste(equipeId, missionId);

        ajouterTachesAMission(mission, tacheIds, equipeId);

        return toResponse(mission);
    }

    @Override
    @Transactional
    public MissionResponse retirerTacheMission(Long equipeId, Long missionId, Long tacheId, Long stagiaireId) {
        log.info("➖ Retrait de la tâche {} de la mission {} de l'équipe {}", tacheId, missionId, equipeId);

        verifierEquipeExiste(equipeId);
        verifierMembreEquipe(equipeId, stagiaireId);
        Mission mission = verifierMissionExiste(equipeId, missionId);

        BacklogTache tache = backlogTacheRepository.findById(tacheId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Tâche introuvable"));

        if (!missionId.equals(tache.getMissionId())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Cette tâche n'appartient pas à cette mission");
        }

        // ✅ Ajouter AVANT la mise à jour du statut
        if (tache.getStatut() != StatutTache.A_FAIRE) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Impossible de retirer la tâche '" + tache.getTitre() +
                            "' : statut " + tache.getStatut() + " (seules les tâches A_FAIRE peuvent être retirées)");
        }

        tache.setMissionId(null);
        tache.setStatut(StatutTache.EN_ATTENTE);
        backlogTacheRepository.save(tache);

        // ✅ Ajouter APRÈS backlogTacheRepository.save(tache)
        List<BacklogTache> tachesRestantes = backlogTacheRepository.findByMissionId(missionId);
        if (tachesRestantes.isEmpty()) {
            missionRepository.delete(mission);
            log.info("🗑️ Mission {} automatiquement supprimée (plus de tâches)", missionId);
            return null; // signale au controller que la mission est supprimée
        }

        log.info("✅ Tâche {} retirée de la mission {}", tacheId, missionId);
        return toResponse(mission);
    }

    private void ajouterTachesAMission(Mission mission, List<Long> tacheIds, Long equipeId) {
        for (Long tacheId : tacheIds) {
            BacklogTache tache = backlogTacheRepository.findById(tacheId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Tâche " + tacheId + " introuvable"));

            if (!tache.getEquipeId().equals(equipeId)) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "La tâche " + tacheId + " n'appartient pas à votre équipe");
            }

            if (tache.getStatut() != StatutTache.EN_ATTENTE) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "La tâche " + tacheId + " n'est plus disponible");
            }

            tache.setMissionId(mission.getId());
            tache.setStatut(StatutTache.A_FAIRE);
            backlogTacheRepository.save(tache);
        }
    }

    private MissionResponse toResponse(Mission mission) {
        List<BacklogTache> taches = backlogTacheRepository.findByMissionId(mission.getId());

        List<TacheMissionResponse> tacheResponses = taches.stream()
                .map(t -> TacheMissionResponse.builder()
                        .id(t.getId())
                        .titre(t.getTitre())
                        .description(t.getDescription())
                        .statut(t.getStatut())
                        .estimationJours(t.getEstimationJours())
                        .priorite(t.getPriorite())
                        .niveau(t.getNiveau())
                        .assigneId(t.getAssigneId())  // ← AJOUTER
                        .build())
                .collect(Collectors.toList());

        return MissionResponse.builder()
                .id(mission.getId())
                .titre(mission.getTitre())
                .description(mission.getDescription())
                .deadline(mission.getDeadline())
                .creeParId(mission.getCreeParId())
                .equipeId(mission.getEquipeId())
                .taches(tacheResponses)
                .dateCreation(mission.getDateCreation())
                .dateMiseAJour(mission.getDateMiseAJour())
                .build();
    }
}