package com.engagement.iam.service.implimentaion;

import com.engagement.iam.dto.DemandeInscriptionResponse;
import com.engagement.iam.dto.TraiterDemandeRequest;
import com.engagement.iam.entity.DemandeInscription;
import com.engagement.iam.entity.Utilisateur;
import com.engagement.iam.entity.enums.StatutCompte;
import com.engagement.iam.entity.enums.StatutDemande;
import com.engagement.iam.repository.DemandeInscriptionRepository;
import com.engagement.iam.repository.UtilisateurRepository;
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
public class DemandeInscriptionService {

    private final DemandeInscriptionRepository demandeRepo;
    private final UtilisateurRepository utilisateurRepo;

    // ─── Lister toutes les demandes (filtre optionnel par statut) ───────────
    @Transactional(readOnly = true)
    public List<DemandeInscriptionResponse> listerDemandes(StatutDemande statut) {
        List<DemandeInscription> demandes = (statut != null)
                ? demandeRepo.findByStatut(statut)
                : demandeRepo.findAllByOrderByDateDemandeDesc();

        return demandes.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // ─── Traiter une demande (approuver ou rejeter) ──────────────────────────
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

            // Activer le compte utilisateur lié
            if (demande.getUtilisateur() != null) {
                Utilisateur utilisateur = demande.getUtilisateur();
                utilisateur.setStatut(StatutCompte.ACTIF);
                utilisateurRepo.save(utilisateur);
            }
        } else {
            demande.setStatut(StatutDemande.REFUSEE);
        }

        return toResponse(demandeRepo.save(demande));
    }

    // ─── Mapper entité → DTO ─────────────────────────────────────────────────
    private DemandeInscriptionResponse toResponse(DemandeInscription d) {
        String role = (d.getUtilisateur() != null && d.getUtilisateur().getTypeCompte() != null)
                ? d.getUtilisateur().getTypeCompte().name()
                : "STAGIAIRE";

        String email = (d.getUtilisateur() != null) ? d.getUtilisateur().getEmail() : "";

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
                .urlImage(d.getUrlImage())
                .build();
    }
}