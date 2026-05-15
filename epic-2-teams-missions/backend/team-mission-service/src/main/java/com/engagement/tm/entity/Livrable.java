package com.engagement.tm.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "livrable")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Livrable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(length = 500)
    private String nomFichier;

    @Column(length = 1000)
    private String lienURL;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "tache_id", nullable = false)
    private Long tacheId;

    @Column(name = "stagiaire_id", nullable = false)
    private Long stagiaireId;

    @Column(name = "equipe_id", nullable = false)
    private Long equipeId;

    @CreationTimestamp
    @Column(name = "date_soumission", updatable = false)
    private LocalDateTime dateSoumission;
}