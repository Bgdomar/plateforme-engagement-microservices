package com.pfe.userprofile.consumer;

import com.pfe.userprofile.entity.*;
import com.pfe.userprofile.event.UserCreatedEvent;
import com.pfe.userprofile.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Component
@RequiredArgsConstructor
@Slf4j
public class UserProfileConsumer {

    private final ProfilUtilisateurRepository profilRepo;
    private final StagiaireRepository stagiaireRepo;
    private final EncadrantRepository encadrantRepo;

    @Value("${app.upload.path:/app/assets/images}")
    private String uploadPath;

    @Value("${app.upload.url-prefix:/uploads/}")
    private String urlPrefix;

    @KafkaListener(topics = "com.engagement.iam.user.registered", groupId = "user-profile-group")
    @Transactional
    public void onUserCreated(UserCreatedEvent event) {
        log.info("📥 Event reçu : userId={}", event.getUserId());

        String avatarUrl = null;
        if (event.getProfileImageBytes() != null && event.getProfileImageBytes().length > 0) {
            avatarUrl = saveProfileImage(event);
            log.info("🖼️ Image sauvegardée: {}", avatarUrl);
        }

        ProfilUtilisateur profil = ProfilUtilisateur.builder()
                .userId(event.getUserId())
                .nom(event.getNom())
                .prenom(event.getPrenom())
                .email(event.getEmail())
                .typeCompte(event.getTypeCompte())
                .avatar(avatarUrl)
                .build();

        profil = profilRepo.save(profil);

        if ("STAGIAIRE".equals(event.getTypeCompte())) {
            Stagiaire stagiaire = Stagiaire.builder()
                    .profil(profil)
                    .niveauEtudes(event.getNiveauEtudes())
                    .filiere(event.getFiliere())
                    .etablissement(event.getEtablissement())
                    .build();
            stagiaireRepo.save(stagiaire);
        } else if ("ENCADRANT".equals(event.getTypeCompte())) {
            Encadrant encadrant = Encadrant.builder()
                    .profil(profil)
                    .departement(event.getDepartement())
                    .specialite(event.getSpecialite())
                    .build();
            encadrantRepo.save(encadrant);
        }

        log.info("✅ Profil créé avec succès pour userId: {}", event.getUserId());
    }

    private String saveProfileImage(UserCreatedEvent event) {
        try {
            Path uploadPathDir = Paths.get(uploadPath);
            if (!Files.exists(uploadPathDir)) {
                Files.createDirectories(uploadPathDir);
                log.info("📁 Dossier créé : {}", uploadPathDir.toAbsolutePath());
            }

            String extension = getExtension(event.getProfileImageFilename());
            String fileName = event.getUserId().toString() + "_" + System.currentTimeMillis() + "." + extension;
            Path filePath = uploadPathDir.resolve(fileName);

            Files.write(filePath, event.getProfileImageBytes());

            String imageUrl = urlPrefix + fileName;
            log.info("🖼️ Image sauvegardée : {}", imageUrl);
            return imageUrl;

        } catch (Exception e) {
            log.error("❌ Erreur sauvegarde image : {}", e.getMessage());
            return null;
        }
    }

    private String getExtension(String filename) {
        if (filename == null) return "jpg";
        int lastDot = filename.lastIndexOf('.');
        return lastDot > 0 ? filename.substring(lastDot + 1).toLowerCase() : "jpg";
    }
}