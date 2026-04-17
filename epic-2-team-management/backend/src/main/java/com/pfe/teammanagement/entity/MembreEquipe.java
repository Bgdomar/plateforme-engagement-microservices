package com.pfe.teammanagement.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "membre_equipe", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"equipe_id", "stagiaire_id"})
})
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class MembreEquipe {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "equipe_id", nullable = false)
    private Equipe equipe;

    @Column(name = "stagiaire_id", nullable = false)
    private UUID stagiaireId;

    @CreationTimestamp
    @Column(name = "date_ajout", updatable = false)
    private LocalDateTime dateAjout;
}