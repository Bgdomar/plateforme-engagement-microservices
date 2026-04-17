package com.engagement.identity.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "profil_stagiaire")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class ProfilStagiaire {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_id", nullable = false, unique = true)
    private UUID userId;

    @OneToOne
    @JoinColumn(name = "profil_id", referencedColumnName = "id")
    private ProfilUtilisateur profil;

    @Column(name = "niveau_etudes", length = 100)
    private String niveauEtudes;

    @Column(length = 100)
    private String filiere;

    @Column(length = 150)
    private String etablissement;
}
