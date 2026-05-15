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
public class EquipeRequest {

    @NotBlank(message = "Le nom de l'équipe est obligatoire")
    private String nom;

    @NotNull(message = "L'ID du sujet est obligatoire")
    private Long sujetId;

    @NotNull(message = "L'ID de l'encadrant est obligatoire")
    private Long encadrantId;
}