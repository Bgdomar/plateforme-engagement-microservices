package com.engagement.tm.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "evaluation")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Evaluation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(columnDefinition = "TEXT")
    private String commentaire;

    private Integer note; // 0-100

    @Column(name = "tache_id", nullable = false)
    private Long tacheId;

    @Column(name = "encadrant_id", nullable = false)
    private Long encadrantId;

    @CreationTimestamp
    @Column(name = "date_evaluation", updatable = false)
    private LocalDateTime dateEvaluation;
}