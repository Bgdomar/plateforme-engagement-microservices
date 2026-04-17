package com.engagement.iam.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "info_stagiaire")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Stagiaire {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "profil_id", nullable = false, unique = true)
    private ProfilUtilisateur profil;

    @Column(name = "niveau_etudes", length = 100)
    private String niveauEtudes;

    @Column(length = 100)
    private String filiere;

    @Column(length = 150)
    private String etablissement;
}