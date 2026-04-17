package com.engagement.identity.service.implementation;

import com.engagement.identity.dto.ProfilResponse;
import com.engagement.identity.dto.UpdateProfilRequest;
import com.engagement.identity.entity.ProfilEncadrant;
import com.engagement.identity.entity.ProfilStagiaire;
import com.engagement.identity.entity.ProfilUtilisateur;
import com.engagement.identity.repository.ProfilEncadrantRepository;
import com.engagement.identity.repository.ProfilStagiaireRepository;
import com.engagement.identity.repository.ProfilUtilisateurRepository;
import com.engagement.identity.service.interfaces.UserProfileService;
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
    private final ProfilStagiaireRepository stagiaireRepo;
    private final ProfilEncadrantRepository encadrantRepo;

    @Value("${app.upload.path:/app/assets/images}")
    private String uploadPath;

    @Value("${app.upload.url-prefix:/uploads/}")
    private String urlPrefix;

    @Override
    public ProfilResponse getProfil(UUID userId) {
        ProfilUtilisateur profil = profilRepo.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Profil introuvable pour userId : " + userId));
        
        return buildProfilResponse(profil);
    }

    @Override
    @Transactional
    public ProfilResponse updateProfil(UUID userId, UpdateProfilRequest request) {
        ProfilUtilisateur profil = profilRepo.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Profil introuvable pour userId : " + userId));

        // Mise à jour des champs communs
        if (hasText(request.getPrenom())) {
            profil.setPrenom(request.getPrenom().trim());
        }
        if (hasText(request.getNom())) {
            profil.setNom(request.getNom().trim());
        }
        profilRepo.save(profil);

        // Mise à jour des champs spécifiques au rôle
        updateRoleSpecificFields(userId, profil.getTypeCompte(), request);

        return getProfil(userId);
    }

    @Override
    @Transactional
    public ProfilResponse uploadAvatar(UUID userId, MultipartFile file) {
        ProfilUtilisateur profil = profilRepo.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Profil introuvable pour userId : " + userId));

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
            }

            Path filePath = uploadPathDir.resolve(fileName);
            Files.write(filePath, file.getBytes());
            log.info("✅ Fichier sauvegardé: {}", filePath.toAbsolutePath());

        } catch (IOException e) {
            log.error("❌ Erreur sauvegarde image: {}", e.getMessage());
            throw new RuntimeException("Erreur sauvegarde image : " + e.getMessage());
        }

        String avatarUrl = urlPrefix + fileName;
        profil.setAvatar(avatarUrl);
        profilRepo.save(profil);

        return getProfil(userId);
    }

    @Override
    @Transactional
    public ProfilResponse deleteAvatar(UUID userId) {
        ProfilUtilisateur profil = profilRepo.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Profil introuvable pour userId : " + userId));

        if (profil.getAvatar() != null) {
            deleteFileFromDisk(profil.getAvatar());
            profil.setAvatar(null);
            profilRepo.save(profil);
        }

        return getProfil(userId);
    }

    private ProfilResponse buildProfilResponse(ProfilUtilisateur profil) {
        String typeCompte = profil.getTypeCompte().toUpperCase();
        
        return switch (typeCompte) {
            case "STAGIAIRE" -> buildStagiaireResponse(profil);
            case "ENCADRANT" -> buildEncadrantResponse(profil);
            default -> buildDefaultResponse(profil);
        };
    }

    private ProfilResponse buildStagiaireResponse(ProfilUtilisateur profil) {
        ProfilStagiaire stagiaire = stagiaireRepo.findByUserId(profil.getUserId())
                .orElseGet(ProfilStagiaire::new);

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

    private ProfilResponse buildEncadrantResponse(ProfilUtilisateur profil) {
        ProfilEncadrant encadrant = encadrantRepo.findByUserId(profil.getUserId())
                .orElseGet(ProfilEncadrant::new);

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

    private ProfilResponse buildDefaultResponse(ProfilUtilisateur profil) {
        return ProfilResponse.builder()
                .userId(profil.getUserId().toString())
                .nom(profil.getNom())
                .prenom(profil.getPrenom())
                .email(profil.getEmail())
                .avatar(profil.getAvatar())
                .typeCompte(profil.getTypeCompte())
                .build();
    }

    private void updateRoleSpecificFields(UUID userId, String typeCompte, UpdateProfilRequest request) {
        switch (typeCompte.toUpperCase()) {
            case "STAGIAIRE" -> updateStagiaire(userId, request);
            case "ENCADRANT" -> updateEncadrant(userId, request);
        }
    }

    private void updateStagiaire(UUID userId, UpdateProfilRequest request) {
        ProfilStagiaire stagiaire = stagiaireRepo.findByUserId(userId)
                .orElse(ProfilStagiaire.builder().userId(userId).build());

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
        }
    }

    private void updateEncadrant(UUID userId, UpdateProfilRequest request) {
        ProfilEncadrant encadrant = encadrantRepo.findByUserId(userId)
                .orElse(ProfilEncadrant.builder().userId(userId).build());

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
        }
    }

    private boolean hasText(String s) {
        return s != null && !s.isBlank();
    }

    private void deleteFileFromDisk(String avatarUrl) {
        try {
            String fileName = avatarUrl.substring(avatarUrl.lastIndexOf('/') + 1);
            Path filePath = Paths.get(uploadPath).resolve(fileName);
            Files.deleteIfExists(filePath);
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
