// LivrableResponse.java
package com.engagement.tm.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class LivrableResponse {
    private Long id;
    private String nomFichier;
    private String lienURL;
    private String description;
    private LocalDateTime dateSoumission;
}