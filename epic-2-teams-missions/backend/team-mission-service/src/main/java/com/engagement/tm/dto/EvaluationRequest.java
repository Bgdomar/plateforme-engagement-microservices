package com.engagement.tm.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class EvaluationRequest {

    private String commentaire;

    @Min(value = 0, message = "La note doit être entre 0 et 100")
    @Max(value = 100, message = "La note doit être entre 0 et 100")
    private Integer note;

    private Boolean valider; // true = VALIDEE avec note, false = REFAIRE commentaire seul
}