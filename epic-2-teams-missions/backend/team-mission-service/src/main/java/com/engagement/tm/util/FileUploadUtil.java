package com.engagement.tm.util;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Component
@Slf4j
public class FileUploadUtil {

    @Value("${app.upload.path:/app/uploads/livrables}")
    private String uploadPath;

    @Value("${app.upload.url-prefix:/api/livrables/download/}")
    private String urlPrefix;

    /**
     * Sauvegarde un fichier livrable et retourne son nom unique
     */
    public String saveLivrableFile(MultipartFile file, Long tacheId, Long stagiaireId) {
        try {
            Path uploadPathDir = Paths.get(uploadPath);
            if (!Files.exists(uploadPathDir)) {
                Files.createDirectories(uploadPathDir);
                log.info("📁 Dossier créé: {}", uploadPathDir.toAbsolutePath());
            }

            // Générer un nom unique : tache_{tacheId}_stagiaire_{stagiaireId}_{timestamp}_{uuid}.extension
            String originalFilename = file.getOriginalFilename();
            String extension = getExtension(originalFilename);
            String fileName = String.format("tache_%d_stagiaire_%d_%d_%s.%s",
                    tacheId, stagiaireId, System.currentTimeMillis(),
                    UUID.randomUUID().toString().substring(0, 8), extension);

            Path filePath = uploadPathDir.resolve(fileName);
            Files.write(filePath, file.getBytes());

            log.info("📁 Livrable sauvegardé: {}", fileName);
            return fileName;

        } catch (IOException e) {
            log.error("❌ Erreur sauvegarde livrable: {}", e.getMessage());
            throw new RuntimeException("Erreur sauvegarde livrable: " + e.getMessage());
        }
    }

    /**
     * Supprime un fichier livrable
     */
    public void deleteLivrableFile(String fileName) {
        try {
            if (fileName != null && !fileName.isBlank()) {
                Path filePath = Paths.get(uploadPath).resolve(fileName);
                boolean deleted = Files.deleteIfExists(filePath);
                if (deleted) {
                    log.info("🗑️ Livrable supprimé: {}", fileName);
                }
            }
        } catch (IOException e) {
            log.warn("⚠️ Impossible de supprimer le livrable: {}", e.getMessage());
        }
    }

    /**
     * Récupère le chemin complet d'un fichier
     */
    public Path getLivrableFilePath(String fileName) {
        return Paths.get(uploadPath).resolve(fileName);
    }

    /**
     * Vérifie si un fichier existe
     */
    public boolean fileExists(String fileName) {
        if (fileName == null || fileName.isBlank()) return false;
        return Files.exists(Paths.get(uploadPath).resolve(fileName));
    }

    private String getExtension(String filename) {
        if (filename == null) return "bin";
        int lastDot = filename.lastIndexOf('.');
        return lastDot > 0 ? filename.substring(lastDot + 1).toLowerCase() : "bin";
    }
}