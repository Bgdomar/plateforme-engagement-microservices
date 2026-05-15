package com.engagement.tm.service.implimentation;

import com.engagement.tm.dto.EquipeResponse;
import com.engagement.tm.dto.MembreEquipeResponse;
import com.engagement.tm.entity.Equipe;
import com.engagement.tm.entity.MembreEquipe;
import com.engagement.tm.entity.Sujet;
import com.engagement.tm.entity.StatutEquipe;
import com.engagement.tm.entity.StatutSujet;
import com.engagement.tm.repository.EquipeRepository;
import com.engagement.tm.repository.MembreEquipeRepository;
import com.engagement.tm.repository.SujetRepository;
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
    private final SujetRepository sujetRepository;

    @Override
    @Transactional
    public EquipeResponse inscrireStagiaire(Long sujetId, Long stagiaireId) {
        log.info("🎯 Inscription du stagiaire {} au sujet {}", stagiaireId, sujetId);

        // 1. Vérifier que le sujet existe et est OUVERT
        Sujet sujet = sujetRepository.findById(sujetId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Sujet introuvable"));

        if (sujet.getStatut() != StatutSujet.OUVERT) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Ce sujet n'est plus disponible");
        }

        // 2. Vérifier si le stagiaire est déjà dans une équipe
        if (membreEquipeRepository.existsByStagiaireId(stagiaireId)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Vous êtes déjà inscrit à un sujet");
        }

        // 3. Chercher une équipe ACTIVE pour ce sujet
        Equipe equipe = equipeRepository.findBySujetIdAndStatut(sujetId, StatutEquipe.ACTIVE)
                .orElse(null);

        // 4. Si aucune équipe active, en créer une nouvelle
        if (equipe == null) {
            long nbEquipes = equipeRepository.countBySujetId(sujetId);
            String nomEquipe = "Equipe " + (nbEquipes + 1);  // ✅ Simple et court !

            log.info("📝 Création d'une nouvelle équipe '{}' pour le sujet {}", nomEquipe, sujetId);

            equipe = Equipe.builder()
                    .nom(nomEquipe)
                    .sujetId(sujetId)
                    .encadrantId(sujet.getEncadrantId())
                    .statut(StatutEquipe.ACTIVE)
                    .nbMembres(0)
                    .build();
            equipe = equipeRepository.save(equipe);
        }

        // 5. Ajouter le stagiaire à l'équipe
        MembreEquipe membre = MembreEquipe.builder()
                .equipe(equipe)
                .stagiaireId(stagiaireId)
                .build();
        membreEquipeRepository.save(membre);

        // 6. Incrémenter nbMembres
        equipe.setNbMembres(equipe.getNbMembres() + 1);

        // 7. Si l'équipe atteint 4 membres, passer en COMPLET
        if (equipe.getNbMembres() >= 4) {
            equipe.setStatut(StatutEquipe.COMPLET);
            log.info("🏁 L'équipe {} est maintenant COMPLETE", equipe.getId());

            // 8. (imbriqué) Vérifier si TOUTES les équipes du sujet sont COMPLÈTES (max 3)
            long nbEquipesCompletes = equipeRepository.countBySujetIdAndStatut(sujetId, StatutEquipe.COMPLET);
            if (nbEquipesCompletes >= 3) {
                sujet.setStatut(StatutSujet.FERMÉ);
                sujetRepository.save(sujet);
                log.info("🔒 Sujet {} fermé car 3 équipes COMPLÈTES atteintes", sujetId);
            }
        }

        equipe = equipeRepository.save(equipe);
        log.info("✅ Stagiaire {} inscrit à l'équipe {}", stagiaireId, equipe.getId());

        return toResponse(equipe, sujet);
    }

    @Override
    @Transactional(readOnly = true)
    public List<EquipeResponse> consulterEquipesParEncadrant(Long encadrantId) {
        log.info("📋 Consultation des équipes pour l'encadrant {}", encadrantId);

        List<Equipe> equipes = equipeRepository.findByEncadrantId(encadrantId);
        return equipes.stream()
                .map(equipe -> {
                    Sujet sujet = sujetRepository.findById(equipe.getSujetId()).orElse(null);
                    return toResponse(equipe, sujet);
                })
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<EquipeResponse> consulterEquipesParStagiaire(Long stagiaireId) {
        log.info("📋 Consultation des équipes pour le stagiaire {}", stagiaireId);

        List<Equipe> equipes = equipeRepository.findEquipesByStagiaireId(stagiaireId);
        return equipes.stream()
                .map(equipe -> {
                    Sujet sujet = sujetRepository.findById(equipe.getSujetId()).orElse(null);
                    return toResponse(equipe, sujet);
                })
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public EquipeResponse consulterEquipeParId(Long equipeId) {
        log.info("📋 Consultation de l'équipe {}", equipeId);

        Equipe equipe = equipeRepository.findByIdWithMembres(equipeId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Équipe introuvable"));

        Sujet sujet = sujetRepository.findById(equipe.getSujetId()).orElse(null);
        return toResponse(equipe, sujet);
    }

    private EquipeResponse toResponse(Equipe equipe, Sujet sujet) {
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
                .sujetId(equipe.getSujetId())
                .sujetTitre(sujet != null ? sujet.getTitre() : null)
                .encadrantId(equipe.getEncadrantId())
                .statut(equipe.getStatut())
                .nbMembres(equipe.getNbMembres())
                .dateCreation(equipe.getDateCreation())
                .dateMiseAJour(equipe.getDateMiseAJour())
                .membres(membresResponse)
                .build();
    }
}