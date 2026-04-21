// MissionRequest.java
package com.engagement.tm.dto;

import com.engagement.tm.entity.NiveauMission;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class MissionRequest {

    @NotBlank(message = "Le titre de la mission est obligatoire")
    private String titre;

    private String description;

    private LocalDate deadline;

    private NiveauMission niveau;

    @NotNull(message = "L'ID du membre (stagiaire) est obligatoire")
    private Long membreEquipeId;  // ID du MembreEquipe (relation)
}