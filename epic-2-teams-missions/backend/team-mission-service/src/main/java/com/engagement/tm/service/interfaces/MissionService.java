package com.engagement.tm.service.interfaces;

import com.engagement.tm.dto.MissionRequest;
import com.engagement.tm.dto.MissionResponse;

import java.util.List;

public interface MissionService {

    MissionResponse creerMission(Long equipeId, Long stagiaireId, MissionRequest request);

    MissionResponse modifierMission(Long equipeId, Long missionId, Long stagiaireId, MissionRequest request);

    void supprimerMission(Long equipeId, Long missionId, Long stagiaireId);

    List<MissionResponse> consulterMissionsParEquipe(Long equipeId);

    MissionResponse consulterMissionParId(Long equipeId, Long missionId);

    MissionResponse ajouterTachesMission(Long equipeId, Long missionId, Long stagiaireId, List<Long> tacheIds);

    MissionResponse retirerTacheMission(Long equipeId, Long missionId, Long tacheId, Long stagiaireId);
}