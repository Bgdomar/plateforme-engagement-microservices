// MissionService.java
package com.engagement.tm.service.interfaces;

import com.engagement.tm.dto.MissionRequest;
import com.engagement.tm.dto.MissionResponse;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface MissionService {

    MissionResponse creerMission(MissionRequest request);

    MissionResponse modifierMission(Long missionId, MissionRequest request);

    void supprimerMission(Long missionId);

    MissionResponse demarrerMission(Long missionId, Long stagiaireId);

    MissionResponse consulterMissionParId(Long missionId);

    List<MissionResponse> consulterMissionsParMembre(Long membreEquipeId);

    List<MissionResponse> consulterMissionsParStagiaire(Long stagiaireId);

    List<MissionResponse> consulterMissionsParEquipe(Long equipeId);

    // Ajoutez ces méthodes dans MissionServiceImpl.java
    @Transactional
    MissionResponse terminerMission(Long missionId, Long stagiaireId);

    @Transactional
    MissionResponse annulerMission(Long missionId, Long stagiaireId);
}