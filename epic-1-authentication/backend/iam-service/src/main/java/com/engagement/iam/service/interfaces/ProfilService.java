package com.engagement.iam.service.interfaces;


import com.engagement.iam.dto.ProfilResponse;
import com.engagement.iam.dto.StagiaireInfo;
import com.engagement.iam.dto.UpdateProfilRequest;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface ProfilService {
    ProfilResponse getProfil(Long userId);
    ProfilResponse updateProfil(Long userId, UpdateProfilRequest request);
    ProfilResponse uploadAvatar(Long userId, MultipartFile file);
    void deleteAvatar(Long userId);
    List<StagiaireInfo> getAllStagiaires();
    StagiaireInfo getStagiaireInfo(Long userId);
    List<ProfilResponse> getAllContacts();
}