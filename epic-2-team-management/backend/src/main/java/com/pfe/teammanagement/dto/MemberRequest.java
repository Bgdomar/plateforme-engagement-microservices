package com.pfe.teammanagement.dto;

import jakarta.validation.constraints.NotNull;
import lombok.*;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MemberRequest {
    @NotNull(message = "L'ID du stagiaire est requis")
    private UUID stagiaireId;
}