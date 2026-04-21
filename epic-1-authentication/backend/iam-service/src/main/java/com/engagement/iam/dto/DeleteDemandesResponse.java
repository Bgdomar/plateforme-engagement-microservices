// dto/DeleteDemandesResponse.java
package com.engagement.iam.dto;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class DeleteDemandesResponse {
    private int totalSupprimees;
    private int totalNonSupprimees;
    private List<String> erreurs;
}
