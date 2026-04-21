package com.engagement.iam.service.implimentaion;


import com.engagement.iam.dto.*;
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
import java.util.ArrayList;
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

    private final ProfilUtilisateurRepository profilUtilisateurRepo;
    private final StagiaireRepository stagiaireRepo;
    private final EncadrantRepository encadrantRepo;

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

    /**
     * Récupère tous les utilisateurs (stagiaires et encadrants)
     * Exclut les administrateurs
     */
    @Transactional(readOnly = true)
    public List<UserInfoResponse> getAllUsers() {
        List<Utilisateur> utilisateurs = utilisateurRepo.findAll().stream()
                .filter(u -> u.getTypeCompte() != TypeCompte.ADMINISTRATEUR)
                .collect(Collectors.toList());

        return utilisateurs.stream()
                .map(this::buildUserInfoResponse)
                .collect(Collectors.toList());
    }

    /**
     * Met à jour le statut d'un utilisateur
     */
    @Transactional
    public UserInfoResponse updateUserStatut(Long userId, UpdateStatutRequest request) {
        Utilisateur utilisateur = utilisateurRepo.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Utilisateur introuvable avec l'ID: " + userId
                ));

        // Vérifier qu'on ne modifie pas un administrateur
        if (utilisateur.getTypeCompte() == TypeCompte.ADMINISTRATEUR) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Impossible de modifier le statut d'un administrateur"
            );
        }

        // Vérifier la transition de statut valide
        validateStatutTransition(utilisateur.getStatut(), request.getStatut());

        StatutCompte ancienStatut = utilisateur.getStatut();
        utilisateur.setStatut(request.getStatut());
        utilisateur = utilisateurRepo.save(utilisateur);

        log.info("✅ Statut utilisateur {} changé de {} à {} (motif: {})",
                utilisateur.getEmail(),
                ancienStatut,
                request.getStatut(),
                request.getMotif() != null ? request.getMotif() : "Aucun motif fourni");

        return buildUserInfoResponse(utilisateur);
    }

    /**
     * Valide que la transition de statut est autorisée
     */
    private void validateStatutTransition(StatutCompte ancien, StatutCompte nouveau) {
        // Toutes les transitions sont autorisées sauf:

        // On ne peut pas "désactiver" un compte déjà désactivé
        if (ancien == StatutCompte.DESACTIVE && nouveau == StatutCompte.DESACTIVE) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Ce compte est déjà désactivé."
            );
        }

        // On ne peut pas "suspendre" un compte déjà suspendu
        if (ancien == StatutCompte.SUSPENDU && nouveau == StatutCompte.SUSPENDU) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Ce compte est déjà suspendu."
            );
        }

        // On ne peut pas "activer" un compte déjà actif
        if (ancien == StatutCompte.ACTIF && nouveau == StatutCompte.ACTIF) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Ce compte est déjà actif."
            );
        }
    }

    /**
     * Construit la réponse UserInfoResponse à partir d'un utilisateur
     */
    private UserInfoResponse buildUserInfoResponse(Utilisateur utilisateur) {
        ProfilUtilisateur profil = profilUtilisateurRepo
                .findByUtilisateurId(utilisateur.getId())
                .orElse(null);

        UserInfoResponse.UserInfoResponseBuilder builder = UserInfoResponse.builder()
                .id(utilisateur.getId())
                .email(utilisateur.getEmail())
                .typeCompte(utilisateur.getTypeCompte())
                .statut(utilisateur.getStatut())
                .dateCreation(utilisateur.getDateCreation())
                .derniereConnexion(utilisateur.getDerniereConnexion());

        if (profil != null) {
            builder.nom(profil.getNom())
                    .prenom(profil.getPrenom())
                    .avatarUrl(profil.getAvatarUrl());

            // Ajouter les infos spécifiques selon le rôle
            if (utilisateur.getTypeCompte() == TypeCompte.STAGIAIRE) {
                stagiaireRepo.findByProfilUserId(utilisateur.getId()).ifPresent(stagiaire -> {
                    builder.niveauEtudes(stagiaire.getNiveauEtudes())
                            .filiere(stagiaire.getFiliere())
                            .etablissement(stagiaire.getEtablissement());
                });
            } else if (utilisateur.getTypeCompte() == TypeCompte.ENCADRANT) {
                encadrantRepo.findByProfilUserId(utilisateur.getId()).ifPresent(encadrant -> {
                    builder.departement(encadrant.getDepartement())
                            .specialite(encadrant.getSpecialite());
                });
            }
        }

        return builder.build();
    }

    // DemandeInscriptionService.java - Ajoutez cette méthode
    @Transactional
    public DeleteDemandesResponse supprimerDemandes(List<Long> demandeIds) {
        List<String> erreurs = new ArrayList<>();
        int totalSupprimees = 0;

        for (Long id : demandeIds) {
            try {
                DemandeInscription demande = demandeRepo.findById(id)
                        .orElseThrow(() -> new RuntimeException("Demande introuvable: " + id));

                // Vérifier que la demande n'est pas en attente
                if (demande.getStatut() == StatutDemande.EN_ATTENTE) {
                    erreurs.add("La demande ID " + id + " est en attente et ne peut pas être supprimée");
                    continue;
                }

                // Supprimer les informations spécifiques associées
                infoStagiaireDemandeRepo.findByDemandeId(id).ifPresent(info ->
                        infoStagiaireDemandeRepo.delete(info));
                infoEncadrantDemandeRepo.findByDemandeId(id).ifPresent(info ->
                        infoEncadrantDemandeRepo.delete(info));

                // Supprimer la demande
                demandeRepo.delete(demande);
                totalSupprimees++;

                log.info("✅ Demande ID {} supprimée (statut: {})", id, demande.getStatut());

            } catch (Exception e) {
                erreurs.add("Erreur lors de la suppression de la demande ID " + id + ": " + e.getMessage());
                log.error("❌ Erreur suppression demande {}: {}", id, e.getMessage());
            }
        }

        return DeleteDemandesResponse.builder()
                .totalSupprimees(totalSupprimees)
                .totalNonSupprimees(demandeIds.size() - totalSupprimees)
                .erreurs(erreurs)
                .build();
    }
}