package com.engagement.tm.repository;

import com.engagement.tm.entity.Evaluation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EvaluationRepository extends JpaRepository<Evaluation, Long> {
    List<Evaluation> findByTacheId(Long tacheId);
    Optional<Evaluation> findFirstByTacheIdOrderByDateEvaluationDesc(Long tacheId);
    boolean existsByTacheId(Long tacheId);
}