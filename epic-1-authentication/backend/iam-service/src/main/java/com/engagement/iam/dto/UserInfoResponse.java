// dto/UserInfoResponse.java
package com.engagement.iam.dto;

import com.engagement.iam.entity.enums.StatutCompte;
import com.engagement.iam.entity.enums.TypeCompte;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
public class UserInfoResponse {
    private Long id;
    private String email;
    private String nom;
    private String prenom;
    private String avatarUrl;
    private TypeCompte typeCompte;
    private StatutCompte statut;
    private LocalDateTime dateCreation;
    private LocalDateTime derniereConnexion;
    private boolean archived;

    // Champs spécifiques stagiaire
    private String niveauEtudes;
    private String filiere;
    private String etablissement;
    private LocalDate dateDebutStage;
    private LocalDate dateFinStage;

    // Champs spécifiques encadrant
    private String departement;
    private String specialite;
}
