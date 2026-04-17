package com.engagement.identity.repository;

import com.engagement.identity.entity.ProfilUtilisateur;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProfilUtilisateurRepository extends JpaRepository<ProfilUtilisateur, UUID> {
    Optional<ProfilUtilisateur> findByUserId(UUID userId);
}
