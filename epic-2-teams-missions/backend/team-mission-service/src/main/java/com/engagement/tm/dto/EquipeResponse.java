package com.engagement.tm.dto;

import com.engagement.tm.entity.StatutEquipe;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class EquipeResponse {
    private Long id;
    private String nom;
    private Long sujetId;
    private String sujetTitre;
    private Long encadrantId;
    private StatutEquipe statut;
    private Integer nbMembres;
    private LocalDateTime dateCreation;
    private LocalDateTime dateMiseAJour;
    private List<MembreEquipeResponse> membres;
}