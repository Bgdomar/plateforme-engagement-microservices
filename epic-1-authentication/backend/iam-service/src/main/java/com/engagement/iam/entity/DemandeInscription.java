package com.engagement.iam.entity;

import com.engagement.iam.entity.Utilisateur;
import com.engagement.iam.entity.enums.StatutDemande;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "demande_inscription")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DemandeInscription {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "utilisateur_id", nullable = false)
    private Utilisateur utilisateur;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private StatutDemande statut = StatutDemande.EN_ATTENTE;

    @Column(nullable = false, length = 100)
    private String nom;

    @Column(nullable = false, length = 100)
    private String prenom;

    @Column(name = "avatar_url", length = 500)
    private String avatarUrl;

    @CreationTimestamp
    @Column(name = "date_demande", updatable = false)
    private LocalDateTime dateDemande;

    @Column(name = "date_traitement")
    private LocalDateTime dateTraitement;

    @Column(name = "commentaire_admin", columnDefinition = "TEXT")
    private String commentaireAdmin;
}