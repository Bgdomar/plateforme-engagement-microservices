package com.engagement.tm.dto;


import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class EquipeResponse {
    private Long id;
    private String nom;
    private String sujet;
    private Long encadrantId;
    private LocalDateTime dateCreation;
    private LocalDateTime dateMiseAJour;
    private List<MembreEquipeResponse> membres;
}
