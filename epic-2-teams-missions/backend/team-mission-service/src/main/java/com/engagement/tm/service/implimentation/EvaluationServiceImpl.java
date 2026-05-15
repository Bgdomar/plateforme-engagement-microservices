package com.engagement.tm.service.implimentation;

import com.engagement.tm.dto.EvaluationRequest;
import com.engagement.tm.dto.EvaluationResponse;
import com.engagement.tm.entity.BacklogTache;
import com.engagement.tm.entity.Equipe;
import com.engagement.tm.entity.Evaluation;
import com.engagement.tm.entity.StatutTache;
import com.engagement.tm.repository.BacklogTacheRepository;
import com.engagement.tm.repository.EquipeRepository;
import com.engagement.tm.repository.EvaluationRepository;
import com.engagement.tm.service.interfaces.EvaluationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

import static org.springframework.http.HttpStatus.BAD_REQUEST;

@Service
@RequiredArgsConstructor
@Slf4j
public class EvaluationServiceImpl implements EvaluationService {

    private final EvaluationRepository evaluationRepository;
    private final BacklogTacheRepository backlogTacheRepository;
    private final EquipeRepository equipeRepository;

    private void verifierEncadrantEquipe(Long equipeId, Long encadrantId) {
        Equipe equipe = equipeRepository.findById(equipeId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Équipe introuvable"));
        if (!equipe.getEncadrantId().equals(encadrantId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Vous n'êtes pas l'encadrant de cette équipe");
        }
    }

    private BacklogTache verifierTacheExiste(Long equipeId, Long tacheId) {
        BacklogTache tache = backlogTacheRepository.findById(tacheId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Tâche introuvable"));
        if (!tache.getEquipeId().equals(equipeId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Cette tâche n'appartient pas à votre équipe");
        }
        return tache;
    }

    @Override
    @Transactional
    public EvaluationResponse evaluerTache(Long equipeId, Long tacheId, Long encadrantId, EvaluationRequest request) {
        log.info("📝 Évaluation de la tâche {} par l'encadrant {}", tacheId, encadrantId);

        verifierEncadrantEquipe(equipeId, encadrantId);
        BacklogTache tache = verifierTacheExiste(equipeId, tacheId);

        // Vérifier que la tâche est complétée
        if (tache.getStatut() != StatutTache.COMPLETEE) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Seules les tâches complétées peuvent être évaluées (statut actuel: " + tache.getStatut() + ")");
        }

        // ✅ Modifier: Vérifier si c'est la première évaluation ou après un REFAIRE
        Evaluation derniereEvaluation = evaluationRepository.findFirstByTacheIdOrderByDateEvaluationDesc(tacheId).orElse(null);

        if (derniereEvaluation != null) {
            // Si la dernière évaluation était VALIDEE, on ne peut pas réévaluer
            if (tache.getStatut() == StatutTache.VALIDEE) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Cette tâche a déjà été validée et ne peut plus être évaluée");
            }
            // Si la dernière évaluation était REFAIRE, on permet une nouvelle évaluation
            if (tache.getStatut() != StatutTache.REFAIRE && tache.getStatut() != StatutTache.COMPLETEE) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Une évaluation est déjà en attente pour cette tâche");
            }
        }

        Evaluation evaluation = Evaluation.builder()
                .commentaire(request.getCommentaire())
                .note(request.getNote())
                .tacheId(tacheId)
                .encadrantId(encadrantId)
                .build();

        evaluation = evaluationRepository.save(evaluation);

        if (Boolean.TRUE.equals(request.getValider())) {
            if (request.getNote() == null) {
                throw new ResponseStatusException(BAD_REQUEST, "La note est obligatoire pour valider");
            }
            tache.setStatut(StatutTache.VALIDEE);
            log.info("✅ Tâche {} validée avec note {}", tacheId, request.getNote());
        } else {
            tache.setStatut(StatutTache.REFAIRE);
            log.info("🔄 Tâche {} marquée à refaire", tacheId);
        }
        backlogTacheRepository.save(tache);

        return toResponse(evaluation);
    }

    @Override
    @Transactional(readOnly = true)
    public EvaluationResponse getEvaluationByTache(Long equipeId, Long tacheId) {
        return evaluationRepository.findFirstByTacheIdOrderByDateEvaluationDesc(tacheId)
                .map(this::toResponse)
                .orElse(null);
    }

    @Override
    @Transactional(readOnly = true)
    public List<EvaluationResponse> getAllEvaluationsByTache(Long equipeId, Long tacheId) {
        return evaluationRepository.findByTacheId(tacheId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    private EvaluationResponse toResponse(Evaluation evaluation) {
        return EvaluationResponse.builder()
                .id(evaluation.getId())
                .commentaire(evaluation.getCommentaire())
                .note(evaluation.getNote())
                .tacheId(evaluation.getTacheId())
                .encadrantId(evaluation.getEncadrantId())
                .dateEvaluation(evaluation.getDateEvaluation())
                .build();
    }
}