package com.engagement.identity.dto;

import com.engagement.identity.entity.enums.StatutDemande;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class DemandeInscriptionResponse {
    private UUID id;
    private String nom;
    private String prenom;
    private String email;
    private String role;
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
