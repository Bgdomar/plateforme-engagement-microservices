package com.engagement.identity.service.implementation;

import com.engagement.identity.dto.DemandeInscriptionResponse;
import com.engagement.identity.dto.TraiterDemandeRequest;
import com.engagement.identity.entity.DemandeInscription;
import com.engagement.identity.entity.ProfilEncadrant;
import com.engagement.identity.entity.ProfilStagiaire;
import com.engagement.identity.entity.ProfilUtilisateur;
import com.engagement.identity.entity.Utilisateur;
import com.engagement.identity.entity.enums.StatutCompte;
import com.engagement.identity.entity.enums.StatutDemande;
import com.engagement.identity.entity.enums.TypeCompte;
import com.engagement.identity.repository.DemandeInscriptionRepository;
import com.engagement.identity.repository.ProfilEncadrantRepository;
import com.engagement.identity.repository.ProfilStagiaireRepository;
import com.engagement.identity.repository.ProfilUtilisateurRepository;
import com.engagement.identity.repository.UtilisateurRepository;
import com.engagement.identity.service.interfaces.DemandeInscriptionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DemandeInscriptionServiceImpl implements DemandeInscriptionService {

    private final DemandeInscriptionRepository demandeRepo;
    private final UtilisateurRepository utilisateurRepo;
    private final ProfilUtilisateurRepository profilRepo;
    private final ProfilStagiaireRepository stagiaireRepo;
    private final ProfilEncadrantRepository encadrantRepo;

    @Override
    @Transactional(readOnly = true)
    public List<DemandeInscriptionResponse> listerDemandes(StatutDemande statut) {
        List<DemandeInscription> demandes = (statut != null)
                ? demandeRepo.findByStatut(statut)
                : demandeRepo.findAllByOrderByDateDemandeDesc();

        return demandes.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public DemandeInscriptionResponse traiterDemande(UUID demandeId, TraiterDemandeRequest req) {
        DemandeInscription demande = demandeRepo.findById(demandeId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Demande introuvable : " + demandeId));

        if (demande.getStatut() != StatutDemande.EN_ATTENTE) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT, "Cette demande a déjà été traitée");
        }

        if (req.getDecision() == TraiterDemandeRequest.Decision.REFUSEE
                && (req.getCommentaire() == null || req.getCommentaire().isBlank())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Un commentaire est obligatoire pour un rejet");
        }

        demande.setDateTraitement(LocalDateTime.now());
        demande.setCommentaireAdmin(req.getCommentaire());

        if (req.getDecision() == TraiterDemandeRequest.Decision.VALIDEE) {
            demande.setStatut(StatutDemande.VALIDEE);
            
            // Activer l'utilisateur et créer son profil
            Utilisateur utilisateur = utilisateurRepo.findById(demande.getUtilisateurId())
                    .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));
            
            utilisateur.setStatut(StatutCompte.ACTIF);
            utilisateurRepo.save(utilisateur);
            
            // Créer le profil utilisateur
            createUserProfile(demande, utilisateur);
        } else {
            demande.setStatut(StatutDemande.REFUSEE);
        }

        return toResponse(demandeRepo.save(demande));
    }

    private void createUserProfile(DemandeInscription demande, Utilisateur utilisateur) {
        // Créer ProfilUtilisateur
        ProfilUtilisateur profil = ProfilUtilisateur.builder()
                .userId(utilisateur.getId())
                .nom(demande.getNom())
                .prenom(demande.getPrenom())
                .email(utilisateur.getEmail())
                .typeCompte(utilisateur.getTypeCompte().name())
                .build();
        profil = profilRepo.save(profil);

        // Créer ProfilStagiaire ou ProfilEncadrant selon le type
        if (utilisateur.getTypeCompte() == TypeCompte.STAGIAIRE) {
            ProfilStagiaire stagiaire = ProfilStagiaire.builder()
                    .userId(utilisateur.getId())
                    .profil(profil)
                    .niveauEtudes(demande.getNiveauEtudes())
                    .filiere(demande.getFiliere())
                    .etablissement(demande.getEtablissement())
                    .build();
            stagiaireRepo.save(stagiaire);
        } else if (utilisateur.getTypeCompte() == TypeCompte.ENCADRANT) {
            ProfilEncadrant encadrant = ProfilEncadrant.builder()
                    .userId(utilisateur.getId())
                    .profil(profil)
                    .departement(demande.getDepartement())
                    .specialite(demande.getSpecialite())
                    .build();
            encadrantRepo.save(encadrant);
        }
    }

    private DemandeInscriptionResponse toResponse(DemandeInscription d) {
        Utilisateur utilisateur = null;
        String role = "STAGIAIRE";
        String email = "";
        
        if (d.getUtilisateurId() != null) {
            utilisateur = utilisateurRepo.findById(d.getUtilisateurId()).orElse(null);
            if (utilisateur != null) {
                role = utilisateur.getTypeCompte().name();
                email = utilisateur.getEmail();
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
                .niveauEtudes(d.getNiveauEtudes())
                .filiere(d.getFiliere())
                .etablissement(d.getEtablissement())
                .departement(d.getDepartement())
                .specialite(d.getSpecialite())
                .urlImage(d.getAvatarUrl())
                .build();
    }
}
