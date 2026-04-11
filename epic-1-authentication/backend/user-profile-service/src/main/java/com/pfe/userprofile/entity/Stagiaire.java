package com.pfe.userprofile.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;

@Entity
@Table(name = "stagiaire")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Stagiaire {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "profil_id", nullable = false)
    private ProfilUtilisateur profil;

    @Column(name = "niveau_etudes", length = 100)
    private String niveauEtudes;

    @Column(length = 100)
    private String filiere;

    @Column(length = 150)
    private String etablissement;
}