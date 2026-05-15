package com.engagement.tm.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AjouterMembreRequest {

    @NotNull(message = "L'ID du stagiaire est obligatoire")
    private Long stagiaireId;
}