package com.engagement.identity.service.interfaces;

import com.engagement.identity.dto.DemandeInscriptionResponse;
import com.engagement.identity.dto.TraiterDemandeRequest;
import com.engagement.identity.entity.enums.StatutDemande;

import java.util.List;
import java.util.UUID;

public interface DemandeInscriptionService {
    List<DemandeInscriptionResponse> listerDemandes(StatutDemande statut);
    DemandeInscriptionResponse traiterDemande(UUID demandeId, TraiterDemandeRequest request);
}
