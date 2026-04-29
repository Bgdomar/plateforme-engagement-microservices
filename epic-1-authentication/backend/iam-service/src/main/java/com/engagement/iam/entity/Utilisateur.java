// Utilisateur.java - Version corrigée
package com.engagement.iam.entity;

import com.engagement.iam.entity.enums.StatutCompte;
import com.engagement.iam.entity.enums.TypeCompte;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;

@Entity
@Table(name = "utilisateur")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Utilisateur {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(name = "mot_de_passe", nullable = false)
    private String motDePasse;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)  // 👈 AJOUTER CETTE ANNOTATION
    @Column(name = "type_compte", nullable = false)
    private TypeCompte typeCompte;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)  // 👈 AJOUTER CETTE ANNOTATION
    @Column(nullable = false)
    @Builder.Default
    private StatutCompte statut = StatutCompte.EN_ATTENTE;

    @CreationTimestamp
    @Column(name = "date_creation", updatable = false)
    private LocalDateTime dateCreation;

    @Column(name = "derniere_connexion")
    private LocalDateTime derniereConnexion;
}