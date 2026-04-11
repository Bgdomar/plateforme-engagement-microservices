// DemandeInscription.java - Supprimer l'annotation @Column nullable false pour urlImage
package com.engagement.iam.entity;

import com.engagement.iam.entity.enums.StatutDemande;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "demande_inscription")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class DemandeInscription {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, length = 100)
    private String nom;

    @Column(nullable = false, length = 100)
    private String prenom;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(nullable = false)
    @Builder.Default
    private StatutDemande statut = StatutDemande.EN_ATTENTE;

    @CreationTimestamp
    @Column(name = "date_demande", updatable = false)
    private LocalDateTime dateDemande;

    @Column(name = "date_traitement")
    private LocalDateTime dateTraitement;

    @Column(name = "commentaire_admin", columnDefinition = "text")
    private String commentaireAdmin;

    @Column(name = "niveau_etudes", length = 100)
    private String niveauEtudes;

    @Column(length = 100)
    private String filiere;

    @Column(length = 150)
    private String etablissement;

    @Column(length = 150)
    private String departement;

    @Column(length = 150)
    private String specialite;

    @Column(name = "url_image", length = 500)  // Supprimer nullable = false
    private String urlImage;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "utilisateur_id")
    private Utilisateur utilisateur;
}