// ProfilUtilisateurRepository.java
package com.engagement.iam.repository;

import com.engagement.iam.entity.ProfilUtilisateur;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ProfilUtilisateurRepository
        extends JpaRepository<ProfilUtilisateur, Long> {  // ✅ Changé de UUID à Long
    Optional<ProfilUtilisateur> findByUtilisateurId(Long userId);
}