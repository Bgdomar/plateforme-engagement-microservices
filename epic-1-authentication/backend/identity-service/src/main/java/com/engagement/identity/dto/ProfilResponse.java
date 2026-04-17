package com.engagement.identity.dto;

import lombok.*;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class ProfilResponse {
    // Commun
    private String userId;
    private String nom;
    private String prenom;
    private String email;
    private String avatar;
    private String typeCompte;

    // Stagiaire uniquement
    private String niveauEtudes;
    private String filiere;
    private String etablissement;

    // Encadrant uniquement
    private String departement;
    private String specialite;
}
