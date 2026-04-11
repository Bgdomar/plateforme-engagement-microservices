package com.pfe.userprofile.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;

@Entity
@Table(name = "encadrant")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Encadrant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "profil_id", nullable = false)
    private ProfilUtilisateur profil;

    @Column(length = 150)
    private String departement;

    @Column(length = 150)
    private String specialite;
}