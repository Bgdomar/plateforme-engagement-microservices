package com.engagement.iam.service.interfaces;

import com.engagement.iam.dto.DemandeInscriptionRequest;
import com.engagement.iam.dto.InscriptionResponse;
import org.springframework.web.multipart.MultipartFile;

public interface InscriptionService {

    InscriptionResponse soumettreDemande(
            DemandeInscriptionRequest request,
            MultipartFile photo,
            MultipartFile profileImage
    );
}