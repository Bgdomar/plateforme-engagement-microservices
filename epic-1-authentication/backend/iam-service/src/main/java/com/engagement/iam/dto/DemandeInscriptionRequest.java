package com.engagement.iam.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DemandeInscriptionRequest {

    @NotBlank(message = "Le nom est obligatoire")
    private String nom;

    @NotBlank(message = "Le prénom est obligatoire")
    private String prenom;

    @NotBlank(message = "L'email est obligatoire")
    @Email(message = "Format email invalide")
    private String email;

    private String avatarUrl;

    @NotBlank(message = "Le mot de passe est obligatoire")
    @Size(min = 8, message = "Minimum 8 caractères")
    private String motDePasse;

    @NotBlank(message = "Le type de compte est obligatoire")
    private String typeCompte;


    // Stagiaire
    private String niveauEtudes;
    private String filiere;
    private String etablissement;

    // Encadrant
    private String departement;
    private String specialite;
}