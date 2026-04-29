package com.engagement.iam.service.implimentaion;

import com.engagement.iam.dto.DemandeInscriptionRequest;
import com.engagement.iam.dto.InscriptionResponse;
import com.engagement.iam.entity.DemandeInscription;
import com.engagement.iam.entity.InfoEncadrantDemande;
import com.engagement.iam.entity.InfoStagiaireDemande;
import com.engagement.iam.entity.Utilisateur;
import com.engagement.iam.entity.enums.StatutCompte;
import com.engagement.iam.entity.enums.TypeCompte;
import com.engagement.iam.repository.DemandeInscriptionRepository;
import com.engagement.iam.repository.EncadrantDemandeRepository;
import com.engagement.iam.repository.StagiaireDemandeRepository;
import com.engagement.iam.repository.UtilisateurRepository;
import com.engagement.iam.client.NotificationClient;
import com.engagement.iam.service.interfaces.InscriptionService;
import com.engagement.iam.util.FileUploadUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
@Slf4j
public class InscriptionServiceImpl implements InscriptionService {

    private final UtilisateurRepository utilisateurRepo;
    private final DemandeInscriptionRepository demandeRepo;
    private final StagiaireDemandeRepository infoStagiaireDemandeRepo;   // 
    private final EncadrantDemandeRepository infoEncadrantDemandeRepo;   // 
    private final BCryptPasswordEncoder passwordEncoder;
    private final FileUploadUtil fileUploadUtil;
    private final NotificationClient notificationClient;

    @Override
    @Transactional
    public InscriptionResponse soumettreDemande(
            DemandeInscriptionRequest request,
            MultipartFile profileImage) {

        // 1. Vérifier email unique
        validateUniqueEmail(request.getEmail());

        // 2. Sauvegarder l'image de profil sur disque (si présente)
        //    → on stocke UNIQUEMENT le nom du fichier (ex: avatar_xxx_yyy.jpg)
        String avatarUrl = null;
        if (profileImage != null && !profileImage.isEmpty()) {
            String prefix = "avatar_" + System.currentTimeMillis();
            avatarUrl = fileUploadUtil.saveImage(profileImage, prefix);
            log.info(" Avatar sauvegardé: {}", avatarUrl);
        }

        // 3. Créer l'utilisateur (statut EN_ATTENTE)
        Utilisateur utilisateur = createUser(request);

        // 4. Créer la demande d'inscription avec l'URL de l'avatar
        DemandeInscription demande = createDemandeInscription(request, utilisateur, avatarUrl);

        // 5.  Sauvegarder les infos spécifiques au rôle (tables temporaires)
        saveRoleInfo(request, demande);

        log.info(" Demande d'inscription complétée pour : {}", utilisateur.getEmail());

        // 6. Notifier l'admin (userId=3) d'une nouvelle demande
        String role = request.getTypeCompte().equalsIgnoreCase("STAGIAIRE") ? "stagiaire" : "encadrant";
        notificationClient.send(
                3L,
                "Nouvelle demande d'inscription",
                request.getPrenom() + " " + request.getNom() + " souhaite rejoindre la plateforme en tant que " + role,
                "SYSTEM"
        );

        // 7. Retourner la réponse
        return buildInscriptionResponse(utilisateur, demande);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Helpers
    // ─────────────────────────────────────────────────────────────────────────

    private void validateUniqueEmail(String email) {
        if (utilisateurRepo.existsByEmail(email)) {
            log.warn("❌ Tentative d'inscription avec email déjà utilisé: {}", email);
            throw new RuntimeException("Email déjà utilisé : " + email);
        }
    }

    private Utilisateur createUser(DemandeInscriptionRequest request) {
        Utilisateur utilisateur = Utilisateur.builder()
                .email(request.getEmail())
                .motDePasse(passwordEncoder.encode(request.getMotDePasse()))
                .typeCompte(TypeCompte.valueOf(request.getTypeCompte().toUpperCase()))
                .statut(StatutCompte.EN_ATTENTE)
                .build();

        utilisateur = utilisateurRepo.save(utilisateur);
        log.info("✅ Utilisateur créé avec ID: {}", utilisateur.getId());
        return utilisateur;
    }

    private DemandeInscription createDemandeInscription(
            DemandeInscriptionRequest request,
            Utilisateur utilisateur,
            String avatarUrl) {

        DemandeInscription demande = DemandeInscription.builder()
                .nom(request.getNom())
                .prenom(request.getPrenom())
                .avatarUrl(avatarUrl)   // URL générée côté serveur, pas celle du request
                .utilisateur(utilisateur)
                .build();

        demande = demandeRepo.save(demande);
        log.info("✅ Demande d'inscription créée avec ID: {}", demande.getId());
        return demande;
    }

    /**
     * ✅ Sauvegarde les informations spécifiques au rôle dans les tables temporaires
     * (info_stagiaire_demande ou info_encadrant_demande).
     * Ces données seront copiées vers info_stagiaire / info_encadrant
     * lors de la validation par l'admin.
     */
    private void saveRoleInfo(DemandeInscriptionRequest request, DemandeInscription demande) {
        TypeCompte type = TypeCompte.valueOf(request.getTypeCompte().toUpperCase());

        if (type == TypeCompte.STAGIAIRE) {
            InfoStagiaireDemande info = InfoStagiaireDemande.builder()
                    .demande(demande)
                    .niveauEtudes(request.getNiveauEtudes())
                    .filiere(request.getFiliere())
                    .etablissement(request.getEtablissement())
                    .build();
            infoStagiaireDemandeRepo.save(info);
            log.info("✅ InfoStagiaireDemande sauvegardé pour demande ID: {}", demande.getId());

        } else if (type == TypeCompte.ENCADRANT) {
            InfoEncadrantDemande info = InfoEncadrantDemande.builder()
                    .demande(demande)
                    .departement(request.getDepartement())
                    .specialite(request.getSpecialite())
                    .build();
            infoEncadrantDemandeRepo.save(info);
            log.info("✅ InfoEncadrantDemande sauvegardé pour demande ID: {}", demande.getId());
        }
    }

    private InscriptionResponse buildInscriptionResponse(
            Utilisateur utilisateur,
            DemandeInscription demande) {

        return InscriptionResponse.builder()
                .success(true)
                .message("Demande soumise avec succès")
                .userId(utilisateur.getId())
                .demandeId(demande.getId())
                .build();
    }
}