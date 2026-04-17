package com.engagement.identity.repository;

import com.engagement.identity.entity.DemandeInscription;
import com.engagement.identity.entity.enums.StatutDemande;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface DemandeInscriptionRepository extends JpaRepository<DemandeInscription, UUID> {

    @Query("SELECT d FROM DemandeInscription d WHERE d.statut = :statut ORDER BY d.dateDemande DESC")
    List<DemandeInscription> findByStatut(StatutDemande statut);

    @Query("SELECT d FROM DemandeInscription d ORDER BY d.dateDemande DESC")
    List<DemandeInscription> findAllByOrderByDateDemandeDesc();
}
