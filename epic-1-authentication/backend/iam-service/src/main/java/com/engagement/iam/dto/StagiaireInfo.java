package com.engagement.iam.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StagiaireInfo {
    private long userId;
    private String nom;
    private String prenom;
    private String email;
    private String avatar;
    private String niveauEtudes;
    private String filiere;
    private String etablissement;
}