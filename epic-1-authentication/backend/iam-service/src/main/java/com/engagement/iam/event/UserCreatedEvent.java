package com.engagement.iam.event;

import lombok.*;

import java.util.UUID;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class UserCreatedEvent {
    private UUID userId;
    private String email;
    private String typeCompte;
    private String nom;
    private String prenom;

    // Stagiaire
    private String niveauEtudes;
    private String filiere;
    private String etablissement;

    // Encadrant
    private String departement;
    private String specialite;

    // Image de profil (avatar) - en bytes pour Kafka
    private byte[] profileImageBytes;
    private String profileImageContentType;
    private String profileImageFilename;
}