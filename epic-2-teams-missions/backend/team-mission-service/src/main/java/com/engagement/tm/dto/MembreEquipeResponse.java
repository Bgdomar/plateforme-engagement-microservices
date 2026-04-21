package com.engagement.tm.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class MembreEquipeResponse {
    private Long id;
    private Long stagiaireId;
    private LocalDateTime dateAjout;
}
