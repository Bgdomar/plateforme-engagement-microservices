package com.engagement.tm.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "backlog_tache")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BacklogTache {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String titre;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NiveauTache niveau;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PrioriteTache priorite;

    /**
     * Cycle de vie de la tâche
     * EN_ATTENTE → A_FAIRE → ASSIGNEE → DEMARREE → COMPLETEE → VALIDEE
     *                  ↑_______↓              ↑_____REFAIRE____↓
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private StatutTache statut = StatutTache.EN_ATTENTE;

    /**
     * ID de l'équipe propriétaire du backlog
     */
    @Column(name = "equipe_id", nullable = false)
    private Long equipeId;

    /**
     * Membre qui a créé la tâche — relation MembreEquipe +créer
     */
    @Column(name = "cree_par_id", nullable = false)
    private Long creeParId;

    /**
     * Mission à laquelle la tâche est rattachée — nullable
     * null = EN_ATTENTE (dans le backlog)
     * renseigné = A_FAIRE ou plus (dans une mission)
     */
    @Column(name = "mission_id")
    private Long missionId;

    /**
     * Membre qui s'est auto-assigné la tâche — relation MembreEquipe +démarrer
     * null tant que statut < ASSIGNEE
     */
    @Column(name = "assigne_id")
    private Long assigneId;

    /**
     * Estimation de la durée en jours
     */
    @Column(name = "estimation_jours")
    private Integer estimationJours;

    /**
     * Date de début effective (renseignée quand statut → DEMARREE)
     */
    @Column(name = "date_debut")
    private LocalDateTime dateDebut;

    @CreationTimestamp
    @Column(name = "date_creation", updatable = false)
    private LocalDateTime dateCreation;

    @UpdateTimestamp
    @Column(name = "date_mise_a_jour")
    private LocalDateTime dateMiseAJour;
}