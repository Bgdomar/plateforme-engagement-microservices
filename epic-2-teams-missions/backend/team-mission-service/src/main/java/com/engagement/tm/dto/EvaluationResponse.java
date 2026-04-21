// EvaluationResponse.java
package com.engagement.tm.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class EvaluationResponse {
    private Long id;
    private String commentaire;
    private Integer pointsAttribues;
    private LocalDateTime dateEvaluation;
    private Long evaluateurId;
}