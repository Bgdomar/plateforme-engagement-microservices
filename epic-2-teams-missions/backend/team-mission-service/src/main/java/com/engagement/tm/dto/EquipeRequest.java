package com.engagement.tm.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class EquipeRequest {

    @NotBlank(message = "Le nom de l'équipe est obligatoire")
    private String nom;

    private String sujet;

    @NotNull(message = "L'ID de l'encadrant est obligatoire")
    private Long encadrantId;

    // ✅ AJOUT : Liste des membres à ajouter lors de la création
    private List<Long> membresIds = new ArrayList<>();
}