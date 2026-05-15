package com.engagement.tm.repository;

import com.engagement.tm.entity.Sujet;
import com.engagement.tm.entity.StatutSujet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SujetRepository extends JpaRepository<Sujet, Long> {

    /**
     * Récupérer tous les sujets d'un encadrant
     */
    List<Sujet> findByEncadrantId(Long encadrantId);

    /**
     * Récupérer tous les sujets par statut (OUVERT ou FERMÉ)
     */
    List<Sujet> findByStatut(StatutSujet statut);

    /**
     * Récupérer tous les sujets OUVERTs (disponibles pour les stagiaires)
     */
    List<Sujet> findByStatutOrderByDateCreationDesc(StatutSujet statut);

    /**
     * Récupérer un sujet avec vérification qu'il appartient bien à l'encadrant
     */
    Optional<Sujet> findByIdAndEncadrantId(Long id, Long encadrantId);

    /**
     * Compter le nombre de sujets par encadrant
     */
    long countByEncadrantId(Long encadrantId);

    /**
     * Compter le nombre de sujets OUVERTs par encadrant
     */
    long countByEncadrantIdAndStatut(Long encadrantId, StatutSujet statut);
}