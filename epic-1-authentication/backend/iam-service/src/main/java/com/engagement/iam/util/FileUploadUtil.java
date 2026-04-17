// util/FileUploadUtil.java
package com.engagement.iam.util;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Component
@Slf4j
public class FileUploadUtil {

    @Value("${app.upload.path:/app/assets/images}")
    private String uploadPath;

    @Value("${app.upload.url-prefix:/uploads/}")
    private String urlPrefix;

    public String saveImage(MultipartFile file, String prefix) {
        try {
            Path uploadPathDir = Paths.get(uploadPath);
            if (!Files.exists(uploadPathDir)) {
                Files.createDirectories(uploadPathDir);
                log.info("📁 Dossier créé: {}", uploadPathDir.toAbsolutePath());
            }

            String extension = getExtension(file.getOriginalFilename());
            String fileName = prefix + "_" + System.currentTimeMillis() + "." + extension;
            Path filePath = uploadPathDir.resolve(fileName);

            Files.write(filePath, file.getBytes());
            log.info("🖼️ Image sauvegardée: {}", fileName);

            return urlPrefix + fileName;

        } catch (IOException e) {
            log.error("❌ Erreur sauvegarde image: {}", e.getMessage());
            throw new RuntimeException("Erreur sauvegarde image: " + e.getMessage());
        }
    }

    public void deleteImage(String imageUrl) {
        try {
            if (imageUrl != null && imageUrl.startsWith(urlPrefix)) {
                String fileName = imageUrl.substring(urlPrefix.length());
                Path filePath = Paths.get(uploadPath).resolve(fileName);
                boolean deleted = Files.deleteIfExists(filePath);
                if (deleted) {
                    log.info("🗑️ Image supprimée: {}", fileName);
                }
            }
        } catch (IOException e) {
            log.warn("⚠️ Impossible de supprimer l'image: {}", e.getMessage());
        }
    }

    private String getExtension(String filename) {
        if (filename == null) return "jpg";
        int lastDot = filename.lastIndexOf('.');
        return lastDot > 0 ? filename.substring(lastDot + 1).toLowerCase() : "jpg";
    }
}