package com.engagement.identity.repository;

import com.engagement.identity.entity.ProfilBiometrique;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProfilBiometriqueRepository extends JpaRepository<ProfilBiometrique, UUID> {
    Optional<ProfilBiometrique> findByUserId(UUID userId);
}
