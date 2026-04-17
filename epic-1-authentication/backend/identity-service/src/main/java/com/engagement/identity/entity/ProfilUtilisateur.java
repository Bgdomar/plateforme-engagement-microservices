package com.engagement.identity.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "profil_utilisateur")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class ProfilUtilisateur {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_id", nullable = false, unique = true)
    private UUID userId;

    @Column(nullable = false, length = 100)
    private String nom;

    @Column(nullable = false, length = 100)
    private String prenom;

    @Column(nullable = false)
    private String email;

    @Column(name = "type_compte", nullable = false, length = 20)
    private String typeCompte;

    @Column(length = 500)
    private String avatar;

    @Column(columnDefinition = "text")
    private String bio;

    @CreationTimestamp
    @Column(name = "date_creation", updatable = false)
    private LocalDateTime dateCreation;

    @UpdateTimestamp
    @Column(name = "date_mise_a_jour")
    private LocalDateTime dateMiseAJour;
}
