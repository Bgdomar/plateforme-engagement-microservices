package com.engagement.iam.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class UpdateStageDatesRequest {

    @NotNull(message = "La date de début est obligatoire")
    private LocalDate dateDebutStage;

    @NotNull(message = "La date de fin est obligatoire")
    private LocalDate dateFinStage;
}
