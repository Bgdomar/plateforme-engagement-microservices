package com.engagement.identity.dto;

import lombok.*;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class DemandeInscriptionRequest {
    private String email;
    private String motDePasse;
    private String typeCompte;
    private String nom;
    private String prenom;
    private String niveauEtudes;
    private String filiere;
    private String etablissement;
    private String departement;
    private String specialite;
    private String poste;
}
