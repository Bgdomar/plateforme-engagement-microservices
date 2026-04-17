package com.engagement.iam.repository;

import com.engagement.iam.entity.Encadrant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface EncadrantRepository extends JpaRepository<Encadrant, Long> {

    // ✅ Correction 1: Utiliser le bon chemin de propriété
    Optional<Encadrant> findByProfil_Utilisateur_Id(Long userId);

    // ✅ Correction 2: Alternative avec @Query explicite
    @Query("SELECT e FROM Encadrant e WHERE e.profil.utilisateur.id = :userId")
    Optional<Encadrant> findByProfilUserId(@Param("userId") Long userId);
}