// MissionResponse.java
package com.engagement.tm.dto;

import com.engagement.tm.entity.NiveauMission;
import com.engagement.tm.entity.StatutMission;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class MissionResponse {
    private Long id;
    private String titre;
    private String description;
    private StatutMission statut;
    private LocalDate deadline;
    private NiveauMission niveau;
    private LocalDateTime dateCreation;
    private LocalDateTime dateDebut;
    private LocalDateTime dateMiseAJour;
    private Long membreEquipeId;
    private Long stagiaireId;  // Pour info, l'ID du stagiaire
    private Long equipeId;      // Pour info, l'ID de l'équipe
    private List<LivrableResponse> livrables;
    private EvaluationResponse evaluation;
}