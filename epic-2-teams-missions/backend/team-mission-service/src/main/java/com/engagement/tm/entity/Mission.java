package com.engagement.tm.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "mission")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Mission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String titre;

    @Column(columnDefinition = "TEXT")
    private String description;

    /**
     * Date limite de la mission
     */
    @Column(nullable = false)
    private LocalDate deadline;

    /**
     * ID du membre de l'équipe qui a créé la mission
     * Relation : MembreEquipe +créer → Mission
     */
    @Column(name = "cree_par_id", nullable = false)
    private Long creeParId;

    /**
     * ID de l'équipe propriétaire (déduit via MembreEquipe mais stocké pour accès direct)
     */
    @Column(name = "equipe_id", nullable = false)
    private Long equipeId;

    @CreationTimestamp
    @Column(name = "date_creation", updatable = false)
    private LocalDateTime dateCreation;

    @UpdateTimestamp
    @Column(name = "date_mise_a_jour")
    private LocalDateTime dateMiseAJour;
}