package com.engagement.iam.dto;

import lombok.*;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class InscriptionResponse {
    private boolean success;
    private String message;
    private long userId;          // pour Facial AI
    private long demandeId;
    private String urlImage;
}