package com.engagement.identity.service.interfaces;

import com.engagement.identity.dto.DemandeInscriptionRequest;
import com.engagement.identity.dto.InscriptionResponse;
import org.springframework.web.multipart.MultipartFile;

public interface InscriptionService {
    InscriptionResponse soumettreDemande(
        DemandeInscriptionRequest request,
        MultipartFile photo,
        MultipartFile profileImage
    );
}
