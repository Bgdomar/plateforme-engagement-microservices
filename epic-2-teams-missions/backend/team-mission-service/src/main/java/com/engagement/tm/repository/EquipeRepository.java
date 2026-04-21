package com.engagement.tm.repository;

import com.engagement.tm.entity.Equipe;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EquipeRepository extends JpaRepository<Equipe, Long> {

    List<Equipe> findByEncadrantId(Long encadrantId);

    @Query("SELECT e FROM Equipe e LEFT JOIN FETCH e.membres WHERE e.id = :id")
    Optional<Equipe> findByIdWithMembres(@Param("id") Long id);

    @Query("SELECT DISTINCT e FROM Equipe e LEFT JOIN FETCH e.membres m WHERE m.stagiaireId = :stagiaireId")
    List<Equipe> findEquipesByStagiaireId(@Param("stagiaireId") Long stagiaireId);
}