package com.engagement.iam.repository;

import com.engagement.iam.entity.Utilisateur;
import com.engagement.iam.entity.enums.StatutCompte;
import com.engagement.iam.entity.enums.TypeCompte;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UtilisateurRepository
        extends JpaRepository<Utilisateur, Long> {

    Optional<Utilisateur> findByEmail(String email);
    boolean existsByEmail(String email);
    List<Utilisateur> findByTypeCompteAndStatut(TypeCompte typeCompte, StatutCompte statut);

    Optional<Utilisateur> findById(Long id);


}