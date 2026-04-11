package com.engagement.iam.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class TraiterDemandeRequest {

    @NotNull(message = "La décision est obligatoire")
    private Decision decision;  // VALIDEE ou REJETER

    private String commentaire; // obligatoire si REJETER, validé dans le service

    public enum Decision {
        VALIDEE,
        REFUSEE
    }
}