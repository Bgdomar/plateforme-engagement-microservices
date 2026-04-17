package com.pfe.teammanagement.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TeamRequest {

    @NotBlank(message = "Le nom de l'équipe est requis")
    @Size(max = 100, message = "Le nom ne peut pas dépasser 100 caractères")
    private String nom;

    @Size(max = 500, message = "Le sujet ne peut pas dépasser 500 caractères")
    private String sujet;

    private List<UUID> membresIds;
}