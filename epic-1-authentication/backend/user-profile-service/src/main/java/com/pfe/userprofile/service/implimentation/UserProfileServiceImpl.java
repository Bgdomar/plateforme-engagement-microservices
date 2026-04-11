package com.pfe.userprofile.service.implimentation;

import com.pfe.userprofile.dto.ProfilResponse;
import com.pfe.userprofile.dto.UpdateProfilRequest;
import com.pfe.userprofile.entity.Encadrant;
import com.pfe.userprofile.entity.ProfilUtilisateur;
import com.pfe.userprofile.entity.Stagiaire;
import com.pfe.userprofile.repository.EncadrantRepository;
import com.pfe.userprofile.repository.ProfilUtilisateurRepository;
import com.pfe.userprofile.repository.StagiaireRepository;
import com.pfe.userprofile.service.interfaces.UserProfileService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserProfileServiceImpl implements UserProfileService {

    private final ProfilUtilisateurRepository profilRepo;
    private final StagiaireRepository stagiaireRepo;
    private final EncadrantRepository encadrantRepo;

    @Value("${app.upload.path:/app/assets/images}")
    private String uploadPath;

    @Value("${app.upload.url-prefix:/uploads/}")
    private String urlPrefix;

    @Override
    public ProfilResponse getProfil(UUID userId) {
        log.debug("📋 Récupération du profil pour userId: {}", userId);
        ProfilUtilisateur profil = findProfil(userId);
        ProfilResponse response = buildProfilResponseByType(profil);
        log.debug("✅ Profil récupéré avec succès pour userId: {}", userId);
        return response;
    }

    @Override
    @Transactional
    public ProfilResponse updateProfil(UUID userId, UpdateProfilRequest request) {
        log.info("🔄 Mise à jour du profil pour userId: {}", userId);
        ProfilUtilisateur profil = findProfil(userId);
        updateCommonFields(profil, request);
        updateRoleSpecificFields(profil, request);
        log.info("✅ Profil mis à jour avec succès pour userId: {}", userId);
        return getProfil(userId);
    }

    @Override
    @Transactional
    public ProfilResponse uploadAvatar(UUID userId, MultipartFile file) {
        log.info("📤 Upload avatar pour userId: {}", userId);
        ProfilUtilisateur profil = findProfil(userId);

        // Supprimer l'ancien fichier si existant
        if (profil.getAvatar() != null) {
            deleteFileFromDisk(profil.getAvatar());
        }

        // Sauvegarder le nouveau fichier
        String fileName = userId + "_" + System.currentTimeMillis() + getExtension(file.getOriginalFilename());

        try {
            Path uploadPathDir = Paths.get(uploadPath);
            if (!Files.exists(uploadPathDir)) {
                Files.createDirectories(uploadPathDir);
                log.info("📁 Dossier d'upload créé: {}", uploadPathDir.toAbsolutePath());
            }

            Path filePath = uploadPathDir.resolve(fileName);
            Files.write(filePath, file.getBytes());
            log.info("✅ Fichier sauvegardé: {}", filePath.toAbsolutePath());

        } catch (IOException e) {
            log.error("❌ Erreur sauvegarde image: {}", e.getMessage());
            throw new RuntimeException("Erreur sauvegarde image : " + e.getMessage());
        }

        // Stocker l'URL relative pour l'accès via le navigateur
        String avatarUrl = urlPrefix + fileName;
        profil.setAvatar(avatarUrl);
        profilRepo.save(profil);

        log.info("✅ Avatar uploadé avec succès: {}", avatarUrl);
        return getProfil(userId);
    }

    @Override
    @Transactional
    public ProfilResponse deleteAvatar(UUID userId) {
        log.info("🗑️ Suppression avatar pour userId: {}", userId);
        ProfilUtilisateur profil = findProfil(userId);
        if (profil.getAvatar() != null) {
            deleteFileFromDisk(profil.getAvatar());
            profil.setAvatar(null);
            profilRepo.save(profil);
            log.info("✅ Avatar supprimé avec succès");
        }
        return getProfil(userId);
    }

    // ─────────────────────────────────────────────────────────────
    //  Private helper methods (inchangés)
    // ─────────────────────────────────────────────────────────────

    private ProfilUtilisateur findProfil(UUID userId) {
        return profilRepo.findByUserId(userId)
                .orElseThrow(() -> {
                    log.error("❌ Profil introuvable pour userId: {}", userId);
                    return new RuntimeException("Profil introuvable pour userId : " + userId);
                });
    }

    private ProfilResponse buildProfilResponseByType(ProfilUtilisateur profil) {
        String typeCompte = profil.getTypeCompte().toUpperCase();
        return switch (typeCompte) {
            case "STAGIAIRE" -> buildStagiaireResponse(profil);
            case "ENCADRANT" -> buildEncadrantResponse(profil);
            default -> {
                log.error("❌ Type de compte inconnu: {}", typeCompte);
                throw new IllegalStateException("Type de compte inconnu : " + typeCompte);
            }
        };
    }

    private void updateCommonFields(ProfilUtilisateur profil, UpdateProfilRequest request) {
        boolean updated = false;
        if (hasText(request.getPrenom())) {
            profil.setPrenom(request.getPrenom().trim());
            updated = true;
        }
        if (hasText(request.getNom())) {
            profil.setNom(request.getNom().trim());
            updated = true;
        }
        if (updated) {
            profilRepo.save(profil);
            log.debug("✅ Champs communs mis à jour pour userId: {}", profil.getUserId());
        }
    }

    private void updateRoleSpecificFields(ProfilUtilisateur profil, UpdateProfilRequest request) {
        String typeCompte = profil.getTypeCompte().toUpperCase();
        switch (typeCompte) {
            case "STAGIAIRE" -> updateStagiaire(profil, request);
            case "ENCADRANT" -> updateEncadrant(profil, request);
            default -> {
                log.error("❌ Type de compte inconnu pour mise à jour: {}", typeCompte);
                throw new IllegalStateException("Type de compte inconnu : " + typeCompte);
            }
        }
    }

    private ProfilResponse buildStagiaireResponse(ProfilUtilisateur profil) {
        Stagiaire stagiaire = stagiaireRepo.findByProfilUserId(profil.getUserId())
                .orElseGet(() -> {
                    log.warn("⚠️ Aucune information stagiaire trouvée pour userId: {}", profil.getUserId());
                    return new Stagiaire();
                });
        return ProfilResponse.builder()
                .userId(profil.getUserId().toString())
                .nom(profil.getNom())
                .prenom(profil.getPrenom())
                .email(profil.getEmail())
                .avatar(profil.getAvatar())
                .typeCompte(profil.getTypeCompte())
                .niveauEtudes(stagiaire.getNiveauEtudes())
                .filiere(stagiaire.getFiliere())
                .etablissement(stagiaire.getEtablissement())
                .build();
    }

    private void updateStagiaire(ProfilUtilisateur profil, UpdateProfilRequest request) {
        Stagiaire stagiaire = stagiaireRepo.findByProfilUserId(profil.getUserId())
                .orElse(Stagiaire.builder().profil(profil).build());
        boolean updated = false;
        if (request.getNiveauEtudes() != null) {
            stagiaire.setNiveauEtudes(request.getNiveauEtudes().trim());
            updated = true;
        }
        if (request.getFiliere() != null) {
            stagiaire.setFiliere(request.getFiliere().trim());
            updated = true;
        }
        if (request.getEtablissement() != null) {
            stagiaire.setEtablissement(request.getEtablissement().trim());
            updated = true;
        }
        if (updated) {
            stagiaireRepo.save(stagiaire);
            log.debug("✅ Données stagiaire mises à jour pour userId: {}", profil.getUserId());
        }
    }

    private ProfilResponse buildEncadrantResponse(ProfilUtilisateur profil) {
        Encadrant encadrant = encadrantRepo.findByProfilUserId(profil.getUserId())
                .orElseGet(() -> {
                    log.warn("⚠️ Aucune information encadrant trouvée pour userId: {}", profil.getUserId());
                    return new Encadrant();
                });
        return ProfilResponse.builder()
                .userId(profil.getUserId().toString())
                .nom(profil.getNom())
                .prenom(profil.getPrenom())
                .email(profil.getEmail())
                .avatar(profil.getAvatar())
                .typeCompte(profil.getTypeCompte())
                .departement(encadrant.getDepartement())
                .specialite(encadrant.getSpecialite())
                .build();
    }

    private void updateEncadrant(ProfilUtilisateur profil, UpdateProfilRequest request) {
        Encadrant encadrant = encadrantRepo.findByProfilUserId(profil.getUserId())
                .orElse(Encadrant.builder().profil(profil).build());
        boolean updated = false;
        if (request.getDepartement() != null) {
            encadrant.setDepartement(request.getDepartement().trim());
            updated = true;
        }
        if (request.getSpecialite() != null) {
            encadrant.setSpecialite(request.getSpecialite().trim());
            updated = true;
        }
        if (updated) {
            encadrantRepo.save(encadrant);
            log.debug("✅ Données encadrant mises à jour pour userId: {}", profil.getUserId());
        }
    }

    private boolean hasText(String s) {
        return s != null && !s.isBlank();
    }

    private void deleteFileFromDisk(String avatarUrl) {
        try {
            // Extraire le nom du fichier de l'URL
            String fileName = avatarUrl.substring(avatarUrl.lastIndexOf('/') + 1);
            Path filePath = Paths.get(uploadPath).resolve(fileName);
            boolean deleted = Files.deleteIfExists(filePath);
            if (deleted) {
                log.info("🗑️ Fichier supprimé: {}", filePath);
            }
        } catch (IOException e) {
            log.warn("⚠️ Impossible de supprimer le fichier: {}", e.getMessage());
        }
    }

    private String getExtension(String filename) {
        if (filename == null) return ".jpg";
        int dot = filename.lastIndexOf('.');
        return dot > 0 ? filename.substring(dot).toLowerCase() : ".jpg";
    }
}