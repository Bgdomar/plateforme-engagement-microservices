package com.engagement.tm.dto;

import com.engagement.tm.entity.StatutSujet;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class SujetResponse {
    private Long id;
    private String titre;
    private String description;
    private Long encadrantId;
    private StatutSujet statut;  // OUVERT ou FERMÉ
    private LocalDateTime dateCreation;
    private LocalDateTime dateMiseAJour;
}