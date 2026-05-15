package com.engagement.tm.service.interfaces;

import com.engagement.tm.dto.BacklogTacheResponse;
import org.springframework.transaction.annotation.Transactional;

public interface TacheAssignmentService {
    BacklogTacheResponse sAutoAssignerTache(Long equipeId, Long tacheId, Long stagiaireId);
    BacklogTacheResponse annulerAssignmentTache(Long equipeId, Long tacheId, Long stagiaireId);
    BacklogTacheResponse demarrerTache(Long equipeId, Long tacheId, Long stagiaireId);

    @Transactional
    BacklogTacheResponse redemarrerTache(Long equipeId, Long tacheId, Long stagiaireId);
}