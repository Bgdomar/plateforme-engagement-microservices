package com.pfe.teammanagement.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "equipe")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Equipe {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, length = 100)
    private String nom;

    @Column(length = 500)
    private String sujet;

    @Column(name = "encadrant_id", nullable = false)
    private UUID encadrantId;

    @CreationTimestamp
    @Column(name = "date_creation", updatable = false)
    private LocalDateTime dateCreation;

    @OneToMany(mappedBy = "equipe", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<MembreEquipe> membres = new ArrayList<>();
}