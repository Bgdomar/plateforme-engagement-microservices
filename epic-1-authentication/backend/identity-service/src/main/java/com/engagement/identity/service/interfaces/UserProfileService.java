package com.engagement.identity.service.interfaces;

import com.engagement.identity.dto.ProfilResponse;
import com.engagement.identity.dto.UpdateProfilRequest;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

public interface UserProfileService {
    ProfilResponse getProfil(UUID userId);
    ProfilResponse updateProfil(UUID userId, UpdateProfilRequest request);
    ProfilResponse uploadAvatar(UUID userId, MultipartFile file);
    ProfilResponse deleteAvatar(UUID userId);
}
