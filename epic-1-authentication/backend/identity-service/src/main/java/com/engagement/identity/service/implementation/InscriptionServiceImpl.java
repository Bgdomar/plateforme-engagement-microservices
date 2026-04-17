package com.engagement.identity.service.implementation;

import com.engagement.identity.dto.DemandeInscriptionRequest;
import com.engagement.identity.dto.InscriptionResponse;
import com.engagement.identity.entity.DemandeInscription;
import com.engagement.identity.entity.ProfilEncadrant;
import com.engagement.identity.entity.ProfilStagiaire;
import com.engagement.identity.entity.ProfilUtilisateur;
import com.engagement.identity.entity.Utilisateur;
import com.engagement.identity.entity.enums.StatutCompte;
import com.engagement.identity.entity.enums.TypeCompte;
import com.engagement.identity.repository.DemandeInscriptionRepository;
import com.engagement.identity.repository.ProfilEncadrantRepository;
import com.engagement.identity.repository.ProfilStagiaireRepository;
import com.engagement.identity.repository.ProfilUtilisateurRepository;
import com.engagement.identity.repository.UtilisateurRepository;
import com.engagement.identity.service.interfaces.InscriptionService;
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
    private final ProfilUtilisateurRepository profilRepo;
    private final ProfilStagiaireRepository stagiaireRepo;
    private final ProfilEncadrantRepository encadrantRepo;
    private final BCryptPasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public InscriptionResponse soumettreDemande(
            DemandeInscriptionRequest request,
            MultipartFile photo,
            MultipartFile profileImage) {

        // 1. Vérifier email unique
        if (utilisateurRepo.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email déjà utilisé : " + request.getEmail());
        }

        // 2. Créer l'utilisateur
        Utilisateur utilisateur = Utilisateur.builder()
                .email(request.getEmail())
                .motDePasse(passwordEncoder.encode(request.getMotDePasse()))
                .typeCompte(TypeCompte.valueOf(request.getTypeCompte().toUpperCase()))
                .statut(StatutCompte.EN_ATTENTE)
                .build();
        utilisateur = utilisateurRepo.save(utilisateur);

        // 3. Créer la demande d'inscription
        DemandeInscription demande = DemandeInscription.builder()
                .utilisateurId(utilisateur.getId())
                .typeCompte(utilisateur.getTypeCompte())
                .nom(request.getNom())
                .prenom(request.getPrenom())
                .niveauEtudes(request.getNiveauEtudes())
                .filiere(request.getFiliere())
                .etablissement(request.getEtablissement())
                .departement(request.getDepartement())
                .specialite(request.getSpecialite())
                .poste(request.getPoste())
                .build();
        demande = demandeRepo.save(demande);

        log.info("✅ Demande d'inscription créée pour : {}", utilisateur.getEmail());

        return InscriptionResponse.builder()
                .success(true)
                .message("Demande soumise avec succès")
                .userId(utilisateur.getId())
                .demandeId(demande.getId())
                .build();
    }
}
