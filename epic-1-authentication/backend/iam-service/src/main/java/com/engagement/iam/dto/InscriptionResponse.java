package com.engagement.iam.dto;

import lombok.*;

import java.util.UUID;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class InscriptionResponse {
    private boolean success;
    private String message;
    private UUID userId;          // pour Facial AI
    private UUID demandeId;
    private String urlImage;
}