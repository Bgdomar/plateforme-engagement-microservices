// ProfilUtilisateurRepository.java
package com.pfe.userprofile.repository;

import com.pfe.userprofile.entity.ProfilUtilisateur;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;

public interface ProfilUtilisateurRepository
        extends JpaRepository<ProfilUtilisateur, Long> {  // ✅ Changé de UUID à Long
    Optional<ProfilUtilisateur> findByUserId(UUID userId);
}