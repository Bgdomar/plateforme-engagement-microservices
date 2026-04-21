// dto/UpdateStatutRequest.java
package com.engagement.iam.dto;

import com.engagement.iam.entity.enums.StatutCompte;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpdateStatutRequest {
    @NotNull(message = "Le statut est obligatoire")
    private StatutCompte statut; // ACTIF, SUSPENDU, DESACTIVE

    private String motif; // Optionnel: raison du changement de statut
}