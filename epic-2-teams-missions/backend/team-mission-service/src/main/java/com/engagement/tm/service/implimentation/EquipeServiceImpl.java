package com.engagement.tm.service.implimentation;

import com.engagement.tm.dto.AjouterMembreRequest;
import com.engagement.tm.dto.EquipeRequest;
import com.engagement.tm.dto.EquipeResponse;
import com.engagement.tm.dto.MembreEquipeResponse;
import com.engagement.tm.entity.Equipe;
import com.engagement.tm.entity.MembreEquipe;
import com.engagement.tm.repository.EquipeRepository;
import com.engagement.tm.repository.MembreEquipeRepository;
import com.engagement.tm.service.interfaces.EquipeService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class EquipeServiceImpl implements EquipeService {

    private final EquipeRepository equipeRepository;
    private final MembreEquipeRepository membreEquipeRepository;


    @Override
    @Transactional
    public EquipeResponse creerEquipe(EquipeRequest request) {
        log.info("📝 Création d'une nouvelle équipe: {}", request.getNom());

        Equipe equipe = Equipe.builder()
                .nom(request.getNom())
                .sujet(request.getSujet())
                .encadrantId(request.getEncadrantId())
                .build();

        equipe = equipeRepository.save(equipe);
        log.info("✅ Équipe créée avec ID: {}", equipe.getId());

        // ✅ AJOUT : Ajouter les membres sélectionnés
        if (request.getMembresIds() != null && !request.getMembresIds().isEmpty()) {
            for (Long stagiaireId : request.getMembresIds()) {
                // Vérifier si le stagiaire n'est pas déjà dans une autre équipe
                if (membreEquipeRepository.findByStagiaireId(stagiaireId).isPresent()) {
                    log.warn("⚠️ Le stagiaire {} est déjà dans une équipe", stagiaireId);
                    continue;
                }

                MembreEquipe membre = MembreEquipe.builder()
                        .equipe(equipe)
                        .stagiaireId(stagiaireId)
                        .build();
                membreEquipeRepository.save(membre);
                log.info("✅ Stagiaire {} ajouté à l'équipe {}", stagiaireId, equipe.getId());
            }
        }

        return toResponse(equipe);
    }

    @Override
    @Transactional
    public MembreEquipeResponse ajouterMembre(Long equipeId, AjouterMembreRequest request) {
        log.info("👥 Ajout du stagiaire {} à l'équipe {}", request.getStagiaireId(), equipeId);

        Equipe equipe = equipeRepository.findById(equipeId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Équipe introuvable"));

        // Vérifier si le stagiaire est déjà dans l'équipe
        if (membreEquipeRepository.existsByEquipeIdAndStagiaireId(equipeId, request.getStagiaireId())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Ce stagiaire est déjà membre de l'équipe");
        }

        MembreEquipe membre = MembreEquipe.builder()
                .equipe(equipe)
                .stagiaireId(request.getStagiaireId())
                .build();

        membre = membreEquipeRepository.save(membre);
        log.info("✅ Stagiaire {} ajouté à l'équipe {}", request.getStagiaireId(), equipeId);

        return MembreEquipeResponse.builder()
                .id(membre.getId())
                .stagiaireId(membre.getStagiaireId())
                .dateAjout(membre.getDateAjout())
                .build();
    }

    @Override
    @Transactional
    public void supprimerMembre(Long equipeId, Long stagiaireId) {
        log.info("🗑️ Suppression du stagiaire {} de l'équipe {}", stagiaireId, equipeId);

        Equipe equipe = equipeRepository.findById(equipeId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Équipe introuvable"));

        if (!membreEquipeRepository.existsByEquipeIdAndStagiaireId(equipeId, stagiaireId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Ce stagiaire n'est pas membre de l'équipe");
        }

        membreEquipeRepository.deleteByEquipeIdAndStagiaireId(equipeId, stagiaireId);
        log.info("✅ Stagiaire {} supprimé de l'équipe {}", stagiaireId, equipeId);
    }

    @Override
    @Transactional
    public void supprimerEquipe(Long equipeId) {
        log.info("🗑️ Suppression de l'équipe {}", equipeId);

        Equipe equipe = equipeRepository.findById(equipeId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Équipe introuvable"));

        equipeRepository.delete(equipe);
        log.info("✅ Équipe {} supprimée", equipeId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<EquipeResponse> consulterEquipesParEncadrant(Long encadrantId) {
        log.info("📋 Consultation des équipes pour l'encadrant {}", encadrantId);

        List<Equipe> equipes = equipeRepository.findByEncadrantId(encadrantId);
        return equipes.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public EquipeResponse consulterEquipeParId(Long equipeId) {
        log.info("📋 Consultation de l'équipe {}", equipeId);

        Equipe equipe = equipeRepository.findByIdWithMembres(equipeId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Équipe introuvable"));

        return toResponse(equipe);
    }

    @Override
    @Transactional(readOnly = true)
    public List<EquipeResponse> consulterEquipesParStagiaire(Long stagiaireId) {
        log.info("📋 Consultation des équipes pour le stagiaire {}", stagiaireId);

        List<Equipe> equipes = equipeRepository.findEquipesByStagiaireId(stagiaireId);
        return equipes.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<EquipeResponse> consulterToutesLesEquipes() {
        log.info("📋 Consultation de toutes les équipes");

        List<Equipe> equipes = equipeRepository.findAll();
        return equipes.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    /**
     * Convertit une entité Equipe en DTO EquipeResponse
     */
    private EquipeResponse toResponse(Equipe equipe) {
        List<MembreEquipeResponse> membresResponse = equipe.getMembres().stream()
                .map(membre -> MembreEquipeResponse.builder()
                        .id(membre.getId())
                        .stagiaireId(membre.getStagiaireId())
                        .dateAjout(membre.getDateAjout())
                        .build())
                .collect(Collectors.toList());

        return EquipeResponse.builder()
                .id(equipe.getId())
                .nom(equipe.getNom())
                .sujet(equipe.getSujet())
                .encadrantId(equipe.getEncadrantId())
                .dateCreation(equipe.getDateCreation())
                .dateMiseAJour(equipe.getDateMiseAJour())
                .membres(membresResponse)
                .build();
    }


    @Override
    @Transactional
    public EquipeResponse updateEquipe(Long equipeId, EquipeRequest request) {
        log.info("📝 Mise à jour de l'équipe {}", equipeId);

        Equipe equipe = equipeRepository.findById(equipeId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Équipe introuvable"));

        // Vérifier que l'encadrant est le même (sécurité)
        if (!equipe.getEncadrantId().equals(request.getEncadrantId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Vous n'êtes pas autorisé à modifier cette équipe");
        }

        equipe.setNom(request.getNom());
        equipe.setSujet(request.getSujet());

        equipe = equipeRepository.save(equipe);
        log.info("✅ Équipe {} mise à jour", equipeId);

        return toResponse(equipe);
    }
}
