package com.engagement.identity.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "profil_encadrant")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class ProfilEncadrant {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_id", nullable = false, unique = true)
    private UUID userId;

    @OneToOne
    @JoinColumn(name = "profil_id", referencedColumnName = "id")
    private ProfilUtilisateur profil;

    @Column(length = 150)
    private String departement;

    @Column(length = 150)
    private String specialite;
}
