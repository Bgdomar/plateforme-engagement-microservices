package com.engagement.iam.dto;

import lombok.*;

/**
 * DTO de réponse unifié pour GET /api/profil/{userId}.
 * Les champs spécifiques au rôle sont null si non applicable.
 *
 *  STAGIAIRE  → niveauEtudes, filiere, etablissement remplis
 *               departement, specialite = null
 *
 *  ENCADRANT  → departement, specialite remplis
 *               niveauEtudes, filiere, etablissement = null
 */
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class ProfilResponse {

    // ── Commun ────────────────────────────────────────────────
    private String userId;
    private String nom;
    private String prenom;
    private String email;
    private String avatar;
    private String typeCompte;   // "STAGIAIRE" | "ENCADRANT"
    private String bio;
    // ── Stagiaire uniquement ──────────────────────────────────
    private String niveauEtudes;
    private String filiere;
    private String etablissement;

    // ── Encadrant uniquement ──────────────────────────────────
    private String departement;
    private String specialite;
}