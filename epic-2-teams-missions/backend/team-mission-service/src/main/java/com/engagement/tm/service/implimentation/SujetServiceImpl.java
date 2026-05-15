package com.engagement.tm.service.implimentation;

import com.engagement.tm.dto.SujetRequest;
import com.engagement.tm.dto.SujetResponse;
import com.engagement.tm.entity.Sujet;
import com.engagement.tm.entity.StatutSujet;
import com.engagement.tm.repository.SujetRepository;
import com.engagement.tm.service.interfaces.SujetService;
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
public class SujetServiceImpl implements SujetService {

    private final SujetRepository sujetRepository;

    @Override
    @Transactional
    public SujetResponse creerSujet(SujetRequest request) {
        log.info("📝 Création d'un nouveau sujet: {}", request.getTitre());

        Sujet sujet = Sujet.builder()
                .titre(request.getTitre())
                .description(request.getDescription())
                .encadrantId(request.getEncadrantId())
                .statut(StatutSujet.OUVERT)  // ✅ Par défaut OUVERT
                .build();

        sujet = sujetRepository.save(sujet);
        log.info("✅ Sujet créé avec ID: {} (statut: OUVERT)", sujet.getId());

        return toResponse(sujet);
    }

    @Override
    @Transactional
    public SujetResponse modifierSujet(Long sujetId, SujetRequest request) {
        log.info("✏️ Modification du sujet {}", sujetId);

        Sujet sujet = sujetRepository.findById(sujetId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Sujet introuvable"));

        // Vérifier que l'encadrant est bien le propriétaire
        if (!sujet.getEncadrantId().equals(request.getEncadrantId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Vous n'êtes pas autorisé à modifier ce sujet");
        }

        sujet.setTitre(request.getTitre());
        sujet.setDescription(request.getDescription());

        sujet = sujetRepository.save(sujet);
        log.info("✅ Sujet {} modifié", sujetId);

        return toResponse(sujet);
    }

    @Override
    @Transactional
    public void supprimerSujet(Long sujetId, Long encadrantId) {
        log.info("🗑️ Suppression du sujet {}", sujetId);

        Sujet sujet = sujetRepository.findById(sujetId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Sujet introuvable"));

        // Vérifier que l'encadrant est bien le propriétaire
        if (!sujet.getEncadrantId().equals(encadrantId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Vous n'êtes pas autorisé à supprimer ce sujet");
        }

        sujetRepository.delete(sujet);
        log.info("✅ Sujet {} supprimé", sujetId);
    }

    @Override
    @Transactional
    public SujetResponse changerStatut(Long sujetId, Long encadrantId, StatutSujet nouveauStatut) {
        log.info("🔄 Changement du statut du sujet {} vers {}", sujetId, nouveauStatut);

        Sujet sujet = sujetRepository.findById(sujetId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Sujet introuvable"));

        // Vérifier que l'encadrant est bien le propriétaire
        if (!sujet.getEncadrantId().equals(encadrantId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Vous n'êtes pas autorisé à modifier ce sujet");
        }

        sujet.setStatut(nouveauStatut);
        sujet = sujetRepository.save(sujet);
        log.info("✅ Sujet {} changé en {}", sujetId, nouveauStatut);

        return toResponse(sujet);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SujetResponse> consulterSujetsParEncadrant(Long encadrantId) {
        log.info("📋 Consultation des sujets pour l'encadrant {}", encadrantId);

        List<Sujet> sujets = sujetRepository.findByEncadrantId(encadrantId);
        return sujets.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public SujetResponse consulterSujetParId(Long sujetId) {
        log.info("📋 Consultation du sujet {}", sujetId);

        Sujet sujet = sujetRepository.findById(sujetId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Sujet introuvable"));

        return toResponse(sujet);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SujetResponse> consulterSujetsOuverts() {
        log.info("📋 Consultation des sujets OUVERTs");

        List<Sujet> sujets = sujetRepository.findByStatutOrderByDateCreationDesc(StatutSujet.OUVERT);
        return sujets.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    private SujetResponse toResponse(Sujet sujet) {
        return SujetResponse.builder()
                .id(sujet.getId())
                .titre(sujet.getTitre())
                .description(sujet.getDescription())
                .encadrantId(sujet.getEncadrantId())
                .statut(sujet.getStatut())
                .dateCreation(sujet.getDateCreation())
                .dateMiseAJour(sujet.getDateMiseAJour())
                .build();
    }
}