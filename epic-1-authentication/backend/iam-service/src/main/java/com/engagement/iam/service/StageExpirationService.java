package com.engagement.iam.service;

import com.engagement.iam.entity.Stagiaire;
import com.engagement.iam.entity.Utilisateur;
import com.engagement.iam.entity.enums.StatutCompte;
import com.engagement.iam.repository.StagiaireRepository;
import com.engagement.iam.repository.UtilisateurRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class StageExpirationService {

    private final StagiaireRepository stagiaireRepository;
    private final UtilisateurRepository utilisateurRepository;

    @Scheduled(cron = "0 0 2 * * ?") // Tous les jours à 2h du matin
    @Transactional
    public void verifierEtArchiverStagesExpire() {
        log.info("Début de la vérification des stages expirés...");
        
        LocalDate aujourdHui = LocalDate.now();
        
        // Récupérer tous les stagiaires non archivés avec une date de fin dépassée
        List<Stagiaire> stagiairesExpires = stagiaireRepository.findStagiairesNonArchivesAvecDateFinPassee(aujourdHui);
        
        log.info("Trouvé {} stagiaires à archiver", stagiairesExpires.size());
        
        for (Stagiaire stagiaire : stagiairesExpires) {
            try {
                // Archiver le stagiaire
                stagiaire.setArchived(true);
                stagiaireRepository.save(stagiaire);
                
                // Désactiver le compte utilisateur associé
                Utilisateur utilisateur = stagiaire.getProfil().getUtilisateur();
                utilisateur.setStatut(StatutCompte.DESACTIVE);
                utilisateur.setArchived(true);
                utilisateurRepository.save(utilisateur);
                
                log.info("Stagiaire {} (ID: {}) archivé et compte désactivé", 
                        stagiaire.getProfil().getNom(), utilisateur.getId());
                        
            } catch (Exception e) {
                log.error("Erreur lors de l'archivage du stagiaire ID: {}", stagiaire.getId(), e);
            }
        }
        
        log.info("Fin de la vérification des stages expirés");
    }
}
