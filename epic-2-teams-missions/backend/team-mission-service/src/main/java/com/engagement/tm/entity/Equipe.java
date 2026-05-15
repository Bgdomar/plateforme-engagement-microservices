package com.engagement.tm.entity;

import com.engagement.tm.entity.StatutEquipe;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "equipe")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Equipe {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String nom;

    @Column(name = "sujet_id", nullable = false)
    private Long sujetId;

    @Column(name = "encadrant_id", nullable = false)
    private Long encadrantId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private StatutEquipe statut = StatutEquipe.ACTIVE;

    @Column(name = "nb_membres", nullable = false)
    @Builder.Default
    private Integer nbMembres = 0;

    @CreationTimestamp
    @Column(name = "date_creation", updatable = false)
    private LocalDateTime dateCreation;

    @UpdateTimestamp
    @Column(name = "date_mise_a_jour")
    private LocalDateTime dateMiseAJour;

    @OneToMany(mappedBy = "equipe", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<MembreEquipe> membres = new ArrayList<>();

    // Ajouter dans Equipe.java
    @OneToMany(mappedBy = "equipeId", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<BacklogTache> backlogTaches = new ArrayList<>();
}