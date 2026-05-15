package com.engagement.tm.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SujetRequest {

    @NotBlank(message = "Le titre du sujet est obligatoire")
    private String titre;

    @NotBlank(message = "La description du sujet est obligatoire")
    private String description;

    @NotNull(message = "L'ID de l'encadrant est obligatoire")
    private Long encadrantId;
}