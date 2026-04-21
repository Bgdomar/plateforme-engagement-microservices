// dto/DeleteDemandesRequest.java
package com.engagement.iam.dto;

import lombok.Data;
import jakarta.validation.constraints.NotNull;
import java.util.List;

@Data
public class DeleteDemandesRequest {
    @NotNull(message = "La liste des IDs est obligatoire")
    private List<Long> demandeIds;
}