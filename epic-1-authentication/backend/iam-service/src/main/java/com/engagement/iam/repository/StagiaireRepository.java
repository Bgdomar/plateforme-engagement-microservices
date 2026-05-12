package com.engagement.iam.repository;

import com.engagement.iam.entity.Stagiaire;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface StagiaireRepository extends JpaRepository<Stagiaire, Long> {

    // ✅ Correction 1: Utiliser le bon chemin de propriété
    Optional<Stagiaire> findByProfil_Utilisateur_Id(Long userId);

    // ✅ Correction 2: Alternative avec @Query explicite
    @Query("SELECT s FROM Stagiaire s WHERE s.profil.utilisateur.id = :userId")
    Optional<Stagiaire> findByProfilUserId(@Param("userId") Long userId);

    // Trouver les stagiaires non archivés avec date de fin de stage dépassée
    @Query("SELECT s FROM Stagiaire s WHERE s.archived = false AND s.dateFinStage < :aujourdHui")
    List<Stagiaire> findStagiairesNonArchivesAvecDateFinPassee(@Param("aujourdHui") LocalDate aujourdHui);
}