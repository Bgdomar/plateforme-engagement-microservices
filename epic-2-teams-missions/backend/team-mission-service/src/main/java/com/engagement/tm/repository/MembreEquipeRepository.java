package com.engagement.tm.repository;

import com.engagement.tm.entity.MembreEquipe;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MembreEquipeRepository extends JpaRepository<MembreEquipe, Long> {

    List<MembreEquipe> findByEquipeId(Long equipeId);

    Optional<MembreEquipe> findByEquipeIdAndStagiaireId(Long equipeId, Long stagiaireId);

    Optional<MembreEquipe> findByStagiaireId(Long stagiaireId);

    // ✅ AJOUTER CETTE MÉTHODE MANQUANTE
    boolean existsByStagiaireId(Long stagiaireId);

    @Query("SELECT DISTINCT m.stagiaireId FROM MembreEquipe m")
    List<Long> findAllStagiaireIdsAffectes();

    @Modifying
    @Query("DELETE FROM MembreEquipe m WHERE m.equipe.id = :equipeId AND m.stagiaireId = :stagiaireId")
    void deleteByEquipeIdAndStagiaireId(@Param("equipeId") Long equipeId, @Param("stagiaireId") Long stagiaireId);

    boolean existsByEquipeIdAndStagiaireId(Long equipeId, Long stagiaireId);

    int countByEquipeId(Long equipeId);
}