package com.pfe.userprofile.dto;

import lombok.*;

/**
 * DTO d'entrée pour PUT /api/profil/{userId}.
 * Les champs spécifiques au rôle sont ignorés si null.
 *
 *  STAGIAIRE  → envoie niveauEtudes, filiere, etablissement
 *  ENCADRANT  → envoie departement, specialite
 */
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
public class UpdateProfilRequest {

    // ── Commun ────────────────────────────────────────────────
    private String prenom;
    private String nom;

    // ── Stagiaire uniquement ──────────────────────────────────
    private String niveauEtudes;
    private String etablissement;
    private String filiere;

    // ── Encadrant uniquement ──────────────────────────────────
    private String departement;
    private String specialite;
}