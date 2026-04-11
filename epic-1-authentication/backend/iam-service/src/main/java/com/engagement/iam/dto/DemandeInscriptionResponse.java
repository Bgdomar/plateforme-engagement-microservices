package com.engagement.iam.dto;

import com.engagement.iam.entity.enums.StatutDemande;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class DemandeInscriptionResponse {
    private UUID id;
    private String nom;
    private String prenom;
    private String email;
    private String role;          // STAGIAIRE ou ENCADRANT (typeCompte de l'utilisateur)
    private StatutDemande statut;
    private LocalDateTime dateDemande;
    private LocalDateTime dateTraitement;
    private String commentaireAdmin;
    private String niveauEtudes;
    private String filiere;
    private String etablissement;
    private String departement;
    private String specialite;
    private String urlImage;
}