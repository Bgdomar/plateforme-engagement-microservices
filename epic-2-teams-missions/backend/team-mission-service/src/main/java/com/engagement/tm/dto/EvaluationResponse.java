package com.engagement.tm.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class EvaluationResponse {
    private Long id;
    private String commentaire;
    private Integer note;
    private Long tacheId;
    private Long encadrantId;
    private LocalDateTime dateEvaluation;
}