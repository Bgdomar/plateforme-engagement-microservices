package com.engagement.identity.entity;

import com.engagement.identity.entity.enums.StatutDemande;
import com.engagement.identity.entity.enums.TypeCompte;
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

    @Column(name = "utilisateur_id")
    private UUID utilisateurId;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(name = "type_compte", nullable = false)
    private TypeCompte typeCompte;

    @Column(nullable = false, length = 100)
    private String nom;

    @Column(nullable = false, length = 100)
    private String prenom;

    @Column(name = "avatar_url", length = 500)
    private String avatarUrl;

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

    // Champs spécifiques Stagiaire
    @Column(name = "niveau_etudes", length = 100)
    private String niveauEtudes;

    @Column(length = 100)
    private String filiere;

    @Column(length = 150)
    private String etablissement;

    // Champs spécifiques Encadrant
    @Column(length = 150)
    private String departement;

    @Column(length = 150)
    private String specialite;

    @Column(length = 150)
    private String poste;
}
