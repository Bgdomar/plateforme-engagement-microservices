package com.engagement.iam.service.implimentaion;

import com.engagement.iam.dto.ProfilResponse;
import com.engagement.iam.dto.StagiaireInfo;
import com.engagement.iam.dto.UpdateProfilRequest;
import com.engagement.iam.entity.Encadrant;
import com.engagement.iam.entity.ProfilUtilisateur;
import com.engagement.iam.entity.Stagiaire;
import com.engagement.iam.entity.Utilisateur;
import com.engagement.iam.repository.*;
import com.engagement.iam.service.interfaces.ProfilService;
import com.engagement.iam.util.FileUploadUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProfilServiceImpl implements ProfilService {

    private final ProfilUtilisateurRepository profilRepo;
    private final StagiaireRepository infoStagiaireRepo;
    private final EncadrantRepository infoEncadrantRepo;
    private final FileUploadUtil fileUploadUtil;

    // ✅ FIX: @Transactional indispensable pour que le lazy proxy Utilisateur
    //    reste accessible pendant toute la durée de buildProfilResponse()
    @Override
    @Transactional(readOnly = true)
    public ProfilResponse getProfil(Long userId) {
        ProfilUtilisateur profil = findProfil(userId);
        return buildProfilResponse(profil);
    }

    @Override
    @Transactional
    public ProfilResponse updateProfil(Long userId, UpdateProfilRequest request) {
        ProfilUtilisateur profil = findProfil(userId);
        Utilisateur utilisateur = profil.getUtilisateur();

        if (request.getPrenom() != null && !request.getPrenom().isBlank()) {
            profil.setPrenom(request.getPrenom());
        }
        if (request.getNom() != null && !request.getNom().isBlank()) {
            profil.setNom(request.getNom());
        }
        if (request.getBio() != null) {
            profil.setBio(request.getBio());
        }
        profilRepo.save(profil);

        if (utilisateur.getTypeCompte().name().equals("STAGIAIRE")) {
            updateStagiaire(profil, request);
        } else if (utilisateur.getTypeCompte().name().equals("ENCADRANT")) {
            updateEncadrant(profil, request);
        }

        log.info("✅ Profil mis à jour pour userId: {}", userId);
        return buildProfilResponse(profil);
    }

    @Override
    @Transactional
    public ProfilResponse uploadAvatar(Long userId, MultipartFile file) {
        ProfilUtilisateur profil = findProfil(userId);

        if (profil.getAvatarUrl() != null) {
            fileUploadUtil.deleteImage(profil.getAvatarUrl());
        }

        String avatarUrl = fileUploadUtil.saveImage(file, "avatar_" + userId);
        profil.setAvatarUrl(avatarUrl);
        profilRepo.save(profil);

        log.info("✅ Avatar uploadé pour userId: {}", userId);
        return buildProfilResponse(profil);
    }

    @Override
    @Transactional
    public void deleteAvatar(Long userId) {
        ProfilUtilisateur profil = findProfil(userId);
        if (profil.getAvatarUrl() != null) {
            fileUploadUtil.deleteImage(profil.getAvatarUrl());
            profil.setAvatarUrl(null);
            profilRepo.save(profil);
            log.info("✅ Avatar supprimé pour userId: {}", userId);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<StagiaireInfo> getAllStagiaires() {
        return profilRepo.findAll().stream()
                .filter(p -> p.getUtilisateur().getTypeCompte().name().equals("STAGIAIRE"))
                .map(this::convertToStagiaireInfo)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public StagiaireInfo getStagiaireInfo(Long userId) {
        ProfilUtilisateur profil = findProfil(userId);
        if (!profil.getUtilisateur().getTypeCompte().name().equals("STAGIAIRE")) {
            throw new RuntimeException("L'utilisateur n'est pas un stagiaire");
        }
        return convertToStagiaireInfo(profil);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProfilResponse> getAllContacts() {
        return profilRepo.findAll().stream()
                .filter(p -> {
                    String type = p.getUtilisateur().getTypeCompte().name();
                    return type.equals("STAGIAIRE") || type.equals("ENCADRANT");
                })
                .map(this::buildProfilResponse)
                .collect(Collectors.toList());
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Helpers (tous appelés dans un contexte transactionnel)
    // ─────────────────────────────────────────────────────────────────────────

    private ProfilUtilisateur findProfil(Long userId) {
        return profilRepo.findByUtilisateurId(userId)
                .orElseThrow(() -> new RuntimeException("Profil introuvable pour userId: " + userId));
    }

    private ProfilResponse buildProfilResponse(ProfilUtilisateur profil) {
        // ✅ Accès à l'entité lazy Utilisateur — OK car la méthode appelante est @Transactional
        Utilisateur utilisateur = profil.getUtilisateur();

        ProfilResponse.ProfilResponseBuilder builder = ProfilResponse.builder()
                .userId(String.valueOf(utilisateur.getId()))
                .nom(profil.getNom())
                .prenom(profil.getPrenom())
                .email(utilisateur.getEmail())
                .avatar(profil.getAvatarUrl())
                .typeCompte(utilisateur.getTypeCompte().name())
                .bio(profil.getBio());

        if (utilisateur.getTypeCompte().name().equals("STAGIAIRE")) {
            infoStagiaireRepo.findByProfilUserId(profil.getUtilisateur().getId()).ifPresent(info ->
                    builder.niveauEtudes(info.getNiveauEtudes())
                            .filiere(info.getFiliere())
                            .etablissement(info.getEtablissement())
            );
        } else if (utilisateur.getTypeCompte().name().equals("ENCADRANT")) {
            infoEncadrantRepo.findByProfilUserId(profil.getUtilisateur().getId()).ifPresent(info ->
                    builder.departement(info.getDepartement())
                            .specialite(info.getSpecialite())
            );
        }

        return builder.build();
    }

    private void updateStagiaire(ProfilUtilisateur profil, UpdateProfilRequest request) {
        Stagiaire info = infoStagiaireRepo.findByProfilUserId(profil.getUtilisateur().getId())
                .orElse(Stagiaire.builder().profil(profil).build());

        boolean updated = false;
        if (request.getNiveauEtudes() != null) { info.setNiveauEtudes(request.getNiveauEtudes()); updated = true; }
        if (request.getFiliere()      != null) { info.setFiliere(request.getFiliere());             updated = true; }
        if (request.getEtablissement()!= null) { info.setEtablissement(request.getEtablissement()); updated = true; }
        if (updated) infoStagiaireRepo.save(info);
    }

    private void updateEncadrant(ProfilUtilisateur profil, UpdateProfilRequest request) {
        Encadrant info = infoEncadrantRepo.findByProfilUserId(profil.getUtilisateur().getId())
                .orElse(Encadrant.builder().profil(profil).build());

        boolean updated = false;
        if (request.getDepartement() != null) { info.setDepartement(request.getDepartement()); updated = true; }
        if (request.getSpecialite()  != null) { info.setSpecialite(request.getSpecialite());   updated = true; }
        if (updated) infoEncadrantRepo.save(info);
    }

    private StagiaireInfo convertToStagiaireInfo(ProfilUtilisateur profil) {
        Stagiaire info = infoStagiaireRepo.findByProfilUserId(profil.getUtilisateur().getId()).orElse(null);
        return StagiaireInfo.builder()
                .userId(profil.getUtilisateur().getId())
                .nom(profil.getNom())
                .prenom(profil.getPrenom())
                .email(profil.getUtilisateur().getEmail())
                .avatar(profil.getAvatarUrl())
                .niveauEtudes(info != null ? info.getNiveauEtudes() : null)
                .filiere(info != null ? info.getFiliere() : null)
                .etablissement(info != null ? info.getEtablissement() : null)
                .build();
    }
}