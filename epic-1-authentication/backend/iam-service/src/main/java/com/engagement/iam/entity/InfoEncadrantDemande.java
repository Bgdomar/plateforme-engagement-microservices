package com.engagement.iam.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "info_encadrant_demande")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InfoEncadrantDemande {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "demande_id", nullable = false, unique = true)
    private DemandeInscription demande;

    @Column(length = 150)
    private String departement;

    @Column(length = 150)
    private String specialite;
}
