package com.engagement.tm.repository;

import com.engagement.tm.entity.BacklogTache;
import com.engagement.tm.entity.StatutTache;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BacklogTacheRepository extends JpaRepository<BacklogTache, Long> {

    List<BacklogTache> findByEquipeIdOrderByPrioriteDescDateCreationDesc(Long equipeId);

    List<BacklogTache> findByEquipeIdAndCreeParId(Long equipeId, Long creeParId);

    void deleteByEquipeIdAndId(Long equipeId, Long tacheId);

    boolean existsByEquipeIdAndId(Long equipeId, Long tacheId);

    @Query("SELECT COUNT(b) FROM BacklogTache b WHERE b.equipeId = :equipeId")
    long countByEquipeId(@Param("equipeId") Long equipeId);

    List<BacklogTache> findByEquipeIdAndStatut(Long equipeId, StatutTache statut);
    // Nouvelle méthode pour le filtrage par statut
    List<BacklogTache> findByEquipeIdAndStatutOrderByPrioriteDescDateCreationDesc(Long equipeId, StatutTache statut);

    // Dans BacklogTacheRepository.java
    List<BacklogTache> findByMissionId(Long missionId);

    List<BacklogTache> findByEquipeIdInAndStatut(List<Long> equipeIds, StatutTache statut);
}