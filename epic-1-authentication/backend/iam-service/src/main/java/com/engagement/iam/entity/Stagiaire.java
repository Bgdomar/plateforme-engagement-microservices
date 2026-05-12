package com.engagement.iam.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

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

    @Column(name = "date_debut_stage")
    private LocalDate dateDebutStage;

    @Column(name = "date_fin_stage")
    private LocalDate dateFinStage;

    @Column(nullable = false)
    @Builder.Default
    private boolean archived = false;
}