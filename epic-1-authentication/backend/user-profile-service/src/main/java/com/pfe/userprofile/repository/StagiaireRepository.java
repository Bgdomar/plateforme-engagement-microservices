package com.pfe.userprofile.repository;

import com.pfe.userprofile.entity.Stagiaire;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;  // Add this import

public interface StagiaireRepository extends JpaRepository<Stagiaire, Long> {
    Optional<Stagiaire> findByProfilUserId(java.util.UUID userId);
}