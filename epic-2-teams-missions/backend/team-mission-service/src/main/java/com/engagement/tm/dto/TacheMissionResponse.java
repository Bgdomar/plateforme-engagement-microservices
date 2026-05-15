package com.engagement.tm.dto;

import com.engagement.tm.entity.NiveauTache;
import com.engagement.tm.entity.PrioriteTache;
import com.engagement.tm.entity.StatutTache;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class TacheMissionResponse {
    private Long id;
    private String titre;
    private String description;
    private StatutTache statut;
    private Integer estimationJours;
    private PrioriteTache priorite;
    private NiveauTache niveau;
    private Long assigneId;  // ← AJOUTER
}