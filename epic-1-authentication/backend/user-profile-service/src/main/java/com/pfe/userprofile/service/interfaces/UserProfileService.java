package com.pfe.userprofile.service.interfaces;

import com.pfe.userprofile.dto.ProfilResponse;
import com.pfe.userprofile.dto.UpdateProfilRequest;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

public interface UserProfileService {

    ProfilResponse getProfil(UUID userId);

    ProfilResponse updateProfil(UUID userId, UpdateProfilRequest request);

    ProfilResponse uploadAvatar(UUID userId, MultipartFile file);
    ProfilResponse deleteAvatar(UUID userId);
}