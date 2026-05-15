package com.engagement.tm.dto;

import com.engagement.tm.entity.NiveauTache;
import com.engagement.tm.entity.PrioriteTache;
import com.engagement.tm.entity.StatutTache;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class BacklogTacheResponse {
    private Long id;
    private String titre;
    private String description;
    private NiveauTache niveau;
    private PrioriteTache priorite;
    private Long equipeId;
    private Long creeParId;
    private String creeParNom;
    private String creeParPrenom;
    private StatutTache statut;
    private Long missionId;
    private Long assigneId;
    private Integer estimationJours;
    private LocalDateTime dateDebut;
    private LocalDateTime dateCreation;
    private LocalDateTime dateMiseAJour;
}