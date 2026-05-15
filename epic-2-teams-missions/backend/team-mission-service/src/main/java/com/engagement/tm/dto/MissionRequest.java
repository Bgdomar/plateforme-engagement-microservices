package com.engagement.tm.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class MissionRequest {

    @NotBlank(message = "Le titre de la mission est obligatoire")
    private String titre;

    private String description;

    @NotNull(message = "La deadline est obligatoire")
    private LocalDate deadline;

    @NotNull(message = "La liste des tâches est obligatoire")
    private List<Long> tacheIds; // IDs des tâches à ajouter depuis le backlog
}