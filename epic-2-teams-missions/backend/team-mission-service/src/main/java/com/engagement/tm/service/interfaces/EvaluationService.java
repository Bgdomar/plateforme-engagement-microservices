package com.engagement.tm.service.interfaces;

import com.engagement.tm.dto.EvaluationRequest;
import com.engagement.tm.dto.EvaluationResponse;

import java.util.List;

public interface EvaluationService {
    EvaluationResponse evaluerTache(Long equipeId, Long tacheId, Long encadrantId, EvaluationRequest request);
    EvaluationResponse getEvaluationByTache(Long equipeId, Long tacheId);
    List<EvaluationResponse> getAllEvaluationsByTache(Long equipeId, Long tacheId);

}