package com.pfe.userprofile.event;

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
    private String niveauEtudes;
    private String filiere;
    private String etablissement;
    private String departement;
    private String specialite;

    // ✅ Mêmes champs pour l'image
    private byte[] profileImageBytes;
    private String profileImageContentType;
    private String profileImageFilename;
}