package com.engagement.iam.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "info_encadrant")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Encadrant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "profil_id", nullable = false)
    private ProfilUtilisateur profil;

    @Column(length = 150)
    private String departement;

    @Column(length = 150)
    private String specialite;
}