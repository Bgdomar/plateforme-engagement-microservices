package com.engagement.iam.repository;

import com.engagement.iam.entity.InfoEncadrantDemande;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EncadrantDemandeRepository extends JpaRepository<InfoEncadrantDemande, Long> {
    Optional<InfoEncadrantDemande> findByDemandeId(Long demandeId);
}
