package com.engagement.iam.service.implimentaion;


import com.engagement.iam.dto.DemandeInscriptionResponse;
import com.engagement.iam.dto.TraiterDemandeRequest;
import com.engagement.iam.entity.*;
import com.engagement.iam.entity.enums.StatutCompte;
import com.engagement.iam.entity.enums.StatutDemande;
import com.engagement.iam.entity.enums.TypeCompte;
import com.engagement.iam.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class DemandeInscriptionService {

    private final DemandeInscriptionRepository demandeRepo;
    private final UtilisateurRepository utilisateurRepo;
    private final ProfilUtilisateurRepository profilRepo;
    private final StagiaireRepository infoStagiaireRepo;
    private final EncadrantRepository infoEncadrantRepo;
    private final StagiaireDemandeRepository infoStagiaireDemandeRepo;
    private final EncadrantDemandeRepository infoEncadrantDemandeRepo;

    @Transactional(readOnly = true)
    public List<DemandeInscriptionResponse> listerDemandes(StatutDemande statut) {
        List<DemandeInscription> demandes = (statut != null)
                ? demandeRepo.findByStatut(statut)
                : demandeRepo.findAllWithUtilisateur();

        return demandes.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public DemandeInscriptionResponse traiterDemande(Long demandeId, TraiterDemandeRequest req) {
        DemandeInscription demande = demandeRepo.findById(demandeId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Demande introuvable"));

        if (demande.getStatut() != StatutDemande.EN_ATTENTE) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Cette demande a déjà été traitée");
        }

        if (req.getDecision() == TraiterDemandeRequest.Decision.REFUSEE
                && (req.getCommentaire() == null || req.getCommentaire().isBlank())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Un commentaire est obligatoire pour un rejet");
        }

        demande.setDateTraitement(LocalDateTime.now());
        demande.setCommentaireAdmin(req.getCommentaire());

        if (req.getDecision() == TraiterDemandeRequest.Decision.VALIDEE) {
            demande.setStatut(StatutDemande.VALIDEE);

            // Activer le compte utilisateur
            Utilisateur utilisateur = demande.getUtilisateur();
            utilisateur.setStatut(StatutCompte.ACTIF);
            utilisateur = utilisateurRepo.save(utilisateur);

            // CRÉER LE PROFIL UTILISATEUR APRÈS VALIDATION
            createUserProfile(demande, utilisateur);
            log.info("✅ Profil utilisateur créé pour userId: {}", utilisateur.getId());

        } else {
            demande.setStatut(StatutDemande.REFUSEE);
        }

        return toResponse(demandeRepo.save(demande));
    }

    private void createUserProfile(DemandeInscription demande, Utilisateur utilisateur) {
        // 1. Créer le profil de base
        ProfilUtilisateur profil = ProfilUtilisateur.builder()
                .utilisateur(utilisateur)
                .nom(demande.getNom())
                .prenom(demande.getPrenom())
                .avatarUrl(demande.getAvatarUrl())
                .build();
        profil = profilRepo.save(profil);

        // 2. Créer les données spécifiques selon le rôle
        if (utilisateur.getTypeCompte() == TypeCompte.STAGIAIRE) {
            InfoStagiaireDemande infoDemande = infoStagiaireDemandeRepo.findByDemandeId(demande.getId()).orElse(null);

            Stagiaire info = Stagiaire.builder()
                    .profil(profil)
                    .niveauEtudes(infoDemande != null ? infoDemande.getNiveauEtudes() : null)
                    .filiere(infoDemande != null ? infoDemande.getFiliere() : null)
                    .etablissement(infoDemande != null ? infoDemande.getEtablissement() : null)
                    .build();
            infoStagiaireRepo.save(info);
            log.info("✅ Données stagiaire créées pour profil: {}", profil.getId());

        } else if (utilisateur.getTypeCompte() == TypeCompte.ENCADRANT) {
            InfoEncadrantDemande infoDemande = infoEncadrantDemandeRepo.findByDemandeId(demande.getId()).orElse(null);

            Encadrant info = Encadrant.builder()
                    .profil(profil)
                    .departement(infoDemande != null ? infoDemande.getDepartement() : null)
                    .specialite(infoDemande != null ? infoDemande.getSpecialite() : null)
                    .build();
            infoEncadrantRepo.save(info);
            log.info("✅ Données encadrant créées pour profil: {}", profil.getId());
        }
    }

    private DemandeInscriptionResponse toResponse(DemandeInscription d) {
        String role = d.getUtilisateur() != null ? d.getUtilisateur().getTypeCompte().name() : null;
        String email = d.getUtilisateur() != null ? d.getUtilisateur().getEmail() : null;

        String niveauEtudes = null, filiere = null, etablissement = null;
        String departement = null, specialite = null;

        if (role != null && role.equals("STAGIAIRE")) {
            InfoStagiaireDemande info = infoStagiaireDemandeRepo.findByDemandeId(d.getId()).orElse(null);
            if (info != null) {
                niveauEtudes = info.getNiveauEtudes();
                filiere = info.getFiliere();
                etablissement = info.getEtablissement();
            }
        } else if (role != null && role.equals("ENCADRANT")) {
            InfoEncadrantDemande info = infoEncadrantDemandeRepo.findByDemandeId(d.getId()).orElse(null);
            if (info != null) {
                departement = info.getDepartement();
                specialite = info.getSpecialite();
            }
        }

        return DemandeInscriptionResponse.builder()
                .id(d.getId())
                .nom(d.getNom())
                .prenom(d.getPrenom())
                .email(email)
                .role(role)
                .statut(d.getStatut())
                .dateDemande(d.getDateDemande())
                .dateTraitement(d.getDateTraitement())
                .commentaireAdmin(d.getCommentaireAdmin())
                .niveauEtudes(niveauEtudes)
                .filiere(filiere)
                .etablissement(etablissement)
                .departement(departement)
                .specialite(specialite)
                .urlImage(d.getAvatarUrl())
                .build();
    }
}