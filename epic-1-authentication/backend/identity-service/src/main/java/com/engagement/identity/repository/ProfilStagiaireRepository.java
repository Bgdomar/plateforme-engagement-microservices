package com.engagement.identity.repository;

import com.engagement.identity.entity.ProfilStagiaire;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProfilStagiaireRepository extends JpaRepository<ProfilStagiaire, UUID> {
    Optional<ProfilStagiaire> findByUserId(UUID userId);
}
