package com.engagement.tm.dto;

import com.engagement.tm.entity.NiveauTache;
import com.engagement.tm.entity.PrioriteTache;
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
public class BacklogTacheRequest {

    @NotBlank(message = "Le titre de la tâche est obligatoire")
    private String titre;

    private String description;

    @NotNull(message = "Le niveau de la tâche est obligatoire")
    private NiveauTache niveau;

    @NotNull(message = "La priorité de la tâche est obligatoire")
    private PrioriteTache priorite;

    private Integer estimationJours;  // nullable, optionnel à la création
}