package com.pfe.userprofile.repository;

import com.pfe.userprofile.entity.Encadrant;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;  // Add this import

public interface EncadrantRepository extends JpaRepository<Encadrant, Long> {
    Optional<Encadrant> findByProfilUserId(java.util.UUID userId);
}