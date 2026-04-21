// MissionRepository.java
package com.engagement.tm.repository;

import com.engagement.tm.entity.Mission;
import com.engagement.tm.entity.StatutMission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MissionRepository extends JpaRepository<Mission, Long> {

    // Récupérer les missions d'un membre spécifique
    List<Mission> findByMembreEquipeId(Long membreEquipeId);

    // Récupérer les missions d'un membre avec un statut spécifique
    List<Mission> findByMembreEquipeIdAndStatut(Long membreEquipeId, StatutMission statut);

    // Récupérer les missions d'une équipe (via les membres)
    @Query("SELECT m FROM Mission m WHERE m.membreEquipe.equipe.id = :equipeId")
    List<Mission> findByEquipeId(@Param("equipeId") Long equipeId);

    // Récupérer les missions d'un stagiaire spécifique
    @Query("SELECT m FROM Mission m WHERE m.membreEquipe.stagiaireId = :stagiaireId")
    List<Mission> findByStagiaireId(@Param("stagiaireId") Long stagiaireId);

    @Query("SELECT m FROM Mission m LEFT JOIN FETCH m.livrables WHERE m.id = :id")
    Optional<Mission> findByIdWithLivrables(@Param("id") Long id);

    @Query("SELECT m FROM Mission m LEFT JOIN FETCH m.evaluation WHERE m.id = :id")
    Optional<Mission> findByIdWithEvaluation(@Param("id") Long id);

    @Query("SELECT m FROM Mission m LEFT JOIN FETCH m.livrables l LEFT JOIN FETCH m.evaluation WHERE m.membreEquipe.id = :membreEquipeId")
    List<Mission> findByMembreEquipeIdWithDetails(@Param("membreEquipeId") Long membreEquipeId);

    // Vérifier qu'une mission appartient bien à un membre
    boolean existsByIdAndMembreEquipeId(Long id, Long membreEquipeId);
}