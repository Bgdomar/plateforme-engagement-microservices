package com.engagement.identity.dto;

import lombok.*;

import java.util.UUID;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class InscriptionResponse {
    private boolean success;
    private String message;
    private UUID userId;
    private UUID demandeId;
    private String urlImage;
}
