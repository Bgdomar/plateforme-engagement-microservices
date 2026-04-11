package com.engagement.iam.service.implimentaion;

import com.engagement.iam.dto.DemandeInscriptionRequest;
import com.engagement.iam.dto.InscriptionResponse;
import com.engagement.iam.entity.DemandeInscription;
import com.engagement.iam.entity.Utilisateur;
import com.engagement.iam.entity.enums.StatutCompte;
import com.engagement.iam.entity.enums.TypeCompte;
import com.engagement.iam.event.UserCreatedEvent;
import com.engagement.iam.event.UserEventProducer;
import com.engagement.iam.repository.DemandeInscriptionRepository;
import com.engagement.iam.repository.UtilisateurRepository;
import com.engagement.iam.service.interfaces.InscriptionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@Service
@RequiredArgsConstructor
@Slf4j
public class InscriptionServiceImpl implements InscriptionService {

    private final UtilisateurRepository utilisateurRepo;
    private final DemandeInscriptionRepository demandeRepo;
    private final BCryptPasswordEncoder passwordEncoder;
    private final UserEventProducer userEventProducer;

    @Override
    @Transactional
    public InscriptionResponse soumettreDemande(
            DemandeInscriptionRequest request,
            MultipartFile photo,
            MultipartFile profileImage
    ) {
        // 1. Vérifier email unique
        validateUniqueEmail(request.getEmail());

        // 2. Créer l'utilisateur (statut EN_ATTENTE)
        Utilisateur utilisateur = createUser(request);

        // 3. Créer la demande d'inscription (sans urlImage)
        DemandeInscription demande = createRegistrationRequest(request, utilisateur);

        // 4. Publier l'événement avec l'image de profil
        publishUserCreatedEvent(request, utilisateur, profileImage);

        log.info("✅ Demande d'inscription complétée pour : {}", utilisateur.getEmail());

        // 5. Retourner la réponse
        return buildInscriptionResponse(utilisateur, demande);
    }

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

    private DemandeInscription createRegistrationRequest(
            DemandeInscriptionRequest request,
            Utilisateur utilisateur
    ) {
        DemandeInscription demande = DemandeInscription.builder()
                .nom(request.getNom())
                .prenom(request.getPrenom())
                .niveauEtudes(request.getNiveauEtudes())
                .filiere(request.getFiliere())
                .etablissement(request.getEtablissement())
                .departement(request.getDepartement())
                .specialite(request.getSpecialite())
                .urlImage(null)
                .utilisateur(utilisateur)
                .build();

        demande = demandeRepo.save(demande);
        log.info("✅ Demande d'inscription créée avec ID: {}", demande.getId());
        return demande;
    }

    private void publishUserCreatedEvent(
            DemandeInscriptionRequest request,
            Utilisateur utilisateur,
            MultipartFile profileImage
    ) {
        UserCreatedEvent.UserCreatedEventBuilder builder = UserCreatedEvent.builder()
                .userId(utilisateur.getId())
                .email(utilisateur.getEmail())
                .typeCompte(utilisateur.getTypeCompte().name())
                .nom(request.getNom())
                .prenom(request.getPrenom())
                .niveauEtudes(request.getNiveauEtudes())
                .filiere(request.getFiliere())
                .etablissement(request.getEtablissement())
                .departement(request.getDepartement())
                .specialite(request.getSpecialite());

        // ✅ Convertir l'image en bytes et l'ajouter à l'événement
        if (profileImage != null && !profileImage.isEmpty()) {
            try {
                builder.profileImageBytes(profileImage.getBytes());
                builder.profileImageContentType(profileImage.getContentType());
                builder.profileImageFilename(profileImage.getOriginalFilename());
                log.info("🖼️ Image de profil ajoutée à l'événement: {} bytes", profileImage.getSize());
            } catch (IOException e) {
                log.error("❌ Erreur conversion image", e);
            }
        }

        UserCreatedEvent event = builder.build();
        userEventProducer.publishUserCreated(event);
    }

    private InscriptionResponse buildInscriptionResponse(
            Utilisateur utilisateur,
            DemandeInscription demande
    ) {
        return InscriptionResponse.builder()
                .success(true)
                .message("Demande soumise avec succès")
                .userId(utilisateur.getId())
                .demandeId(demande.getId())
                .urlImage(null)
                .build();
    }
}