package com.pfe.teammanagement.repository;

import com.pfe.teammanagement.entity.Equipe;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface EquipeRepository extends JpaRepository<Equipe, UUID> {

    List<Equipe> findByEncadrantId(UUID encadrantId);

    Optional<Equipe> findByIdAndEncadrantId(UUID id, UUID encadrantId);

    @Query("SELECT e FROM Equipe e JOIN e.membres m WHERE m.stagiaireId = :stagiaireId")
    List<Equipe> findEquipesByStagiaireId(@Param("stagiaireId") UUID stagiaireId);

    boolean existsByEncadrantIdAndNom(UUID encadrantId, String nom);
}