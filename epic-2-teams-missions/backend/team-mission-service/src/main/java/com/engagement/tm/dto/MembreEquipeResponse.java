package com.engagement.tm.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class MembreEquipeResponse {
    private Long id;
    private Long stagiaireId;
    private String stagiaireNom;
    private String stagiairePrenom;
    private String stagiaireEmail;
    private LocalDateTime dateAjout;
}