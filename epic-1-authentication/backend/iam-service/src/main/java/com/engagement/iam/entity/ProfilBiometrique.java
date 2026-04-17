package com.engagement.iam.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "profil_biometrique")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProfilBiometrique {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private Utilisateur utilisateur;

    @Column(columnDefinition = "vector(128)")
    private String embedding;

    @CreationTimestamp
    @Column(name = "date_enregistrement", updatable = false)
    private LocalDateTime dateEnregistrement;
}