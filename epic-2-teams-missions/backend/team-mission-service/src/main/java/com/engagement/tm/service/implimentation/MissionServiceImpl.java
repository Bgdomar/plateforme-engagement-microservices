// MissionServiceImpl.java
package com.engagement.tm.service.implimentation;

import com.engagement.tm.dto.EvaluationResponse;
import com.engagement.tm.dto.LivrableResponse;
import com.engagement.tm.dto.MissionRequest;
import com.engagement.tm.dto.MissionResponse;
import com.engagement.tm.entity.MembreEquipe;
import com.engagement.tm.entity.Mission;
import com.engagement.tm.entity.StatutMission;
import com.engagement.tm.repository.MembreEquipeRepository;
import com.engagement.tm.repository.MissionRepository;
import com.engagement.tm.service.interfaces.MissionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class MissionServiceImpl implements MissionService {

    private final MissionRepository missionRepository;
    private final MembreEquipeRepository membreEquipeRepository;

    @Override
    @Transactional
    public MissionResponse creerMission(MissionRequest request) {
        log.info("📝 Création d'une nouvelle mission pour le membre {}", request.getMembreEquipeId());

        MembreEquipe membreEquipe = membreEquipeRepository.findById(request.getMembreEquipeId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Membre d'équipe introuvable"));

        Mission mission = Mission.builder()
                .titre(request.getTitre())
                .description(request.getDescription())
                .statut(StatutMission.A_FAIRE)
                .deadline(request.getDeadline())
                .niveau(request.getNiveau())
                .membreEquipe(membreEquipe)
                .build();

        mission = missionRepository.save(mission);
        log.info("✅ Mission créée avec ID: {}", mission.getId());

        return toResponse(mission);
    }

    @Override
    @Transactional
    public MissionResponse modifierMission(Long missionId, MissionRequest request) {
        log.info("📝 Modification de la mission {}", missionId);

        Mission mission = missionRepository.findById(missionId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Mission introuvable"));

        // Vérifier si la mission n'est pas déjà terminée ou annulée
        if (mission.getStatut() == StatutMission.TERMINEE || mission.getStatut() == StatutMission.ANNULEE) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Impossible de modifier une mission terminée ou annulée");
        }

        mission.setTitre(request.getTitre());
        mission.setDescription(request.getDescription());
        mission.setDeadline(request.getDeadline());
        mission.setNiveau(request.getNiveau());

        mission = missionRepository.save(mission);
        log.info("✅ Mission {} modifiée", missionId);

        return toResponse(mission);
    }

    @Override
    @Transactional
    public void supprimerMission(Long missionId) {
        log.info("🗑️ Suppression de la mission {}", missionId);

        Mission mission = missionRepository.findById(missionId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Mission introuvable"));

        // Seules les missions non commencées peuvent être supprimées
        if (mission.getStatut() != StatutMission.A_FAIRE) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Seules les missions à faire peuvent être supprimées");
        }

        missionRepository.delete(mission);
        log.info("✅ Mission {} supprimée", missionId);
    }

    @Override
    @Transactional
    public MissionResponse demarrerMission(Long missionId, Long stagiaireId) {
        log.info("🚀 Démarrage de la mission {} par le stagiaire {}", missionId, stagiaireId);

        Mission mission = missionRepository.findById(missionId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Mission introuvable"));

        // Vérifier que le stagiaire est bien celui à qui la mission est assignée
        if (!mission.getMembreEquipe().getStagiaireId().equals(stagiaireId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "Vous n'êtes pas assigné à cette mission");
        }

        // Vérifier que la mission est à l'état "À faire"
        if (mission.getStatut() != StatutMission.A_FAIRE) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Cette mission ne peut pas être démarrée (statut actuel: " + mission.getStatut() + ")");
        }

        mission.setStatut(StatutMission.EN_COURS);
        mission.setDateDebut(LocalDateTime.now());

        mission = missionRepository.save(mission);
        log.info("✅ Mission {} démarrée", missionId);

        return toResponse(mission);
    }

    @Override
    @Transactional(readOnly = true)
    public MissionResponse consulterMissionParId(Long missionId) {
        log.info("📋 Consultation de la mission {}", missionId);

        Mission mission = missionRepository.findByIdWithLivrables(missionId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Mission introuvable"));

        return toResponse(mission);
    }

    @Override
    @Transactional(readOnly = true)
    public List<MissionResponse> consulterMissionsParMembre(Long membreEquipeId) {
        log.info("📋 Consultation des missions pour le membre {}", membreEquipeId);

        List<Mission> missions = missionRepository.findByMembreEquipeIdWithDetails(membreEquipeId);
        return missions.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<MissionResponse> consulterMissionsParStagiaire(Long stagiaireId) {
        log.info("📋 Consultation des missions pour le stagiaire {}", stagiaireId);

        List<Mission> missions = missionRepository.findByStagiaireId(stagiaireId);
        return missions.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<MissionResponse> consulterMissionsParEquipe(Long equipeId) {
        log.info("📋 Consultation des missions pour l'équipe {}", equipeId);

        List<Mission> missions = missionRepository.findByEquipeId(equipeId);
        return missions.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    private MissionResponse toResponse(Mission mission) {
        return MissionResponse.builder()
                .id(mission.getId())
                .titre(mission.getTitre())
                .description(mission.getDescription())
                .statut(mission.getStatut())
                .deadline(mission.getDeadline())
                .niveau(mission.getNiveau())
                .dateCreation(mission.getDateCreation())
                .dateDebut(mission.getDateDebut())
                .dateMiseAJour(mission.getDateMiseAJour())
                .membreEquipeId(mission.getMembreEquipe().getId())
                .stagiaireId(mission.getMembreEquipe().getStagiaireId())
                .equipeId(mission.getMembreEquipe().getEquipe().getId())
                .livrables(mission.getLivrables() != null ? mission.getLivrables().stream()
                        .map(l -> LivrableResponse.builder()
                                .id(l.getId())
                                .nomFichier(l.getNomFichier())
                                .lienURL(l.getLienURL())
                                .description(l.getDescription())
                                .dateSoumission(l.getDateSoumission())
                                .build())
                        .collect(Collectors.toList()) : null)
                .evaluation(mission.getEvaluation() != null ? EvaluationResponse.builder()
                        .id(mission.getEvaluation().getId())
                        .commentaire(mission.getEvaluation().getCommentaire())
                        .pointsAttribues(mission.getEvaluation().getPointsAttribues())
                        .dateEvaluation(mission.getEvaluation().getDateEvaluation())
                        .evaluateurId(mission.getEvaluation().getEvaluateurId())
                        .build() : null)
                .build();
    }


    // Ajoutez ces méthodes dans MissionServiceImpl.java
    @Transactional
    @Override
    public MissionResponse terminerMission(Long missionId, Long stagiaireId) {
        log.info("🏁 Terminer la mission {} par le stagiaire {}", missionId, stagiaireId);

        Mission mission = missionRepository.findById(missionId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Mission introuvable"));

        // Vérifier que le stagiaire est bien celui assigné
        if (!mission.getMembreEquipe().getStagiaireId().equals(stagiaireId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "Vous n'êtes pas assigné à cette mission");
        }

        // Vérifier que la mission est en cours
        if (mission.getStatut() != StatutMission.EN_COURS) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Seules les missions en cours peuvent être terminées. Statut actuel: " + mission.getStatut());
        }

        mission.setStatut(StatutMission.TERMINEE);
        mission = missionRepository.save(mission);
        log.info("✅ Mission {} terminée", missionId);

        return toResponse(mission);
    }

    @Transactional
    @Override
    public MissionResponse annulerMission(Long missionId, Long stagiaireId) {
        log.info("❌ Annulation de la mission {} par le stagiaire {}", missionId, stagiaireId);

        Mission mission = missionRepository.findById(missionId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Mission introuvable"));

        // Vérifier que le stagiaire est bien celui assigné
        if (!mission.getMembreEquipe().getStagiaireId().equals(stagiaireId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "Vous n'êtes pas assigné à cette mission");
        }

        // Vérifier que la mission n'est pas déjà terminée
        if (mission.getStatut() == StatutMission.TERMINEE) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Impossible d'annuler une mission terminée");
        }

        mission.setStatut(StatutMission.ANNULEE);
        mission = missionRepository.save(mission);
        log.info("✅ Mission {} annulée", missionId);

        return toResponse(mission);
    }
}