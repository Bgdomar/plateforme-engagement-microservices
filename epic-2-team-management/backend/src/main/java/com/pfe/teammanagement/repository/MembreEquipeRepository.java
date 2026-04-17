package com.pfe.teammanagement.repository;

import com.pfe.teammanagement.entity.MembreEquipe;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface MembreEquipeRepository extends JpaRepository<MembreEquipe, UUID> {

    List<MembreEquipe> findByEquipeId(UUID equipeId);

    Optional<MembreEquipe> findByEquipeIdAndStagiaireId(UUID equipeId, UUID stagiaireId);

    @Modifying
    @Transactional
    @Query("DELETE FROM MembreEquipe m WHERE m.equipe.id = :equipeId AND m.stagiaireId = :stagiaireId")
    void deleteByEquipeIdAndStagiaireId(@Param("equipeId") UUID equipeId, @Param("stagiaireId") UUID stagiaireId);

    @Modifying
    @Transactional
    @Query("DELETE FROM MembreEquipe m WHERE m.equipe.id = :equipeId")
    void deleteByEquipeId(@Param("equipeId") UUID equipeId);

    long countByEquipeId(UUID equipeId);
}