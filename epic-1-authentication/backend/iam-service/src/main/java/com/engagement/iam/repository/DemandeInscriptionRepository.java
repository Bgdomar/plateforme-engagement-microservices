package com.engagement.iam.repository;

import com.engagement.iam.entity.DemandeInscription;
import com.engagement.iam.entity.enums.StatutDemande;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DemandeInscriptionRepository extends JpaRepository<DemandeInscription, Long> {  // ✅ Long au lieu de UUID

    List<DemandeInscription> findByStatut(StatutDemande statut);

    @Query("SELECT d FROM DemandeInscription d LEFT JOIN FETCH d.utilisateur WHERE d.statut = :statut")
    List<DemandeInscription> findByStatutWithUtilisateur(StatutDemande statut);

    @Query("SELECT d FROM DemandeInscription d LEFT JOIN FETCH d.utilisateur ORDER BY d.dateDemande DESC")
    List<DemandeInscription> findAllWithUtilisateur();

    // ✅ Correction : Optional car findById retourne Optional
    Optional<DemandeInscription> findById(Long demandeId);
}