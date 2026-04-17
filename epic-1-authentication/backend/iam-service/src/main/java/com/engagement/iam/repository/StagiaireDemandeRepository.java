package com.engagement.iam.repository;

import com.engagement.iam.entity.InfoStagiaireDemande;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface StagiaireDemandeRepository extends JpaRepository<InfoStagiaireDemande, Long> {
    Optional<InfoStagiaireDemande> findByDemandeId(Long demandeId);
}