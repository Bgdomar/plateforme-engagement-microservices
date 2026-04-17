package com.pfe.teammanagement.dto;

import lombok.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TeamResponse {
    private UUID id;
    private String nom;
    private String sujet;
    private UUID encadrantId;
    private String encadrantNom;
    private String encadrantPrenom;
    private LocalDateTime dateCreation;
    private List<MembreResponse> membres;
    private long nombreMembres;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class MembreResponse {
        private UUID id;
        private UUID stagiaireId;
        private String nom;
        private String prenom;
        private String email;
        private String avatar;
        private LocalDateTime dateAjout;
    }
}