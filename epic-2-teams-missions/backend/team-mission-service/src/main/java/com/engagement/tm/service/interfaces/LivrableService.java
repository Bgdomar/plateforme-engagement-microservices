package com.engagement.tm.service.interfaces;

import com.engagement.tm.dto.LivrableRequest;
import com.engagement.tm.dto.LivrableResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface LivrableService {
    LivrableResponse soumettreLivrable(Long equipeId, Long tacheId, Long stagiaireId,
                                       LivrableRequest request, MultipartFile fichier);
    List<LivrableResponse> getLivrablesByTache(Long equipeId, Long tacheId);
    LivrableResponse getDernierLivrable(Long equipeId, Long tacheId);
    byte[] telechargerFichier(String fileName);  // Nouvelle méthode
}