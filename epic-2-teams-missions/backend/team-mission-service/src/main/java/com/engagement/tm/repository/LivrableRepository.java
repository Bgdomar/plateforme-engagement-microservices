package com.engagement.tm.repository;

import com.engagement.tm.entity.Livrable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LivrableRepository extends JpaRepository<Livrable, Long> {
    List<Livrable> findByTacheId(Long tacheId);
    Optional<Livrable> findFirstByTacheIdOrderByDateSoumissionDesc(Long tacheId);
    boolean existsByTacheId(Long tacheId);
}