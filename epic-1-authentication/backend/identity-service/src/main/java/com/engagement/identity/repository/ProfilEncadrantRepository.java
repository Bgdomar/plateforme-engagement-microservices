package com.engagement.identity.repository;

import com.engagement.identity.entity.ProfilEncadrant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProfilEncadrantRepository extends JpaRepository<ProfilEncadrant, UUID> {
    Optional<ProfilEncadrant> findByUserId(UUID userId);
}
