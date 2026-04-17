package com.engagement.iam.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "info_stagiaire_demande")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InfoStagiaireDemande {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "demande_id", nullable = false, unique = true)
    private DemandeInscription demande;

    @Column(name = "niveau_etudes", length = 100)
    private String niveauEtudes;

    @Column(length = 100)
    private String filiere;

    @Column(length = 150)
    private String etablissement;
}