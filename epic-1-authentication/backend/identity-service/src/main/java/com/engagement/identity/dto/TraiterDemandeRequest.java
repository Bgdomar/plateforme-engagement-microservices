package com.engagement.identity.dto;

import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class TraiterDemandeRequest {

    public enum Decision {
        VALIDEE, REFUSEE
    }

    @NotNull
    private Decision decision;

    private String commentaire;
}
