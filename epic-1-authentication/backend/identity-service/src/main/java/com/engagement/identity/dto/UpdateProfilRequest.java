package com.engagement.identity.dto;

import lombok.*;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class UpdateProfilRequest {
    // Commun
    private String prenom;
    private String nom;

    // Stagiaire uniquement
    private String niveauEtudes;
    private String etablissement;
    private String filiere;

    // Encadrant uniquement
    private String departement;
    private String specialite;
}
