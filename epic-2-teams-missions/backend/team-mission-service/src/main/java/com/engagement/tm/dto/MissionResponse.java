package com.engagement.tm.dto;

import com.engagement.tm.entity.BacklogTache;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class MissionResponse {
    private Long id;
    private String titre;
    private String description;
    private LocalDate deadline;
    private Long creeParId;
    private Long equipeId;
    private List<TacheMissionResponse> taches;
    private LocalDateTime dateCreation;
    private LocalDateTime dateMiseAJour;
}