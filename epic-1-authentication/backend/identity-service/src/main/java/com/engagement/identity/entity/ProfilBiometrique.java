package com.engagement.identity.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "profil_biometrique")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class ProfilBiometrique {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_id", nullable = false, unique = true)
    private UUID userId;

    @Column(name = "embedding", columnDefinition = "float[]")
    private float[] embedding;

    @Column(name = "photo_url", length = 500)
    private String photoUrl;

    @CreationTimestamp
    @Column(name = "date_enregistrement", updatable = false)
    private LocalDateTime dateEnregistrement;
}
