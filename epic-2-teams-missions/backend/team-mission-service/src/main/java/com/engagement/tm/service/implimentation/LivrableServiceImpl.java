package com.engagement.tm.service.implimentation;

import com.engagement.tm.dto.LivrableRequest;
import com.engagement.tm.dto.LivrableResponse;
import com.engagement.tm.entity.BacklogTache;
import com.engagement.tm.entity.Livrable;
import com.engagement.tm.entity.StatutTache;
import com.engagement.tm.repository.BacklogTacheRepository;
import com.engagement.tm.repository.EquipeRepository;
import com.engagement.tm.repository.LivrableRepository;
import com.engagement.tm.repository.MembreEquipeRepository;
import com.engagement.tm.service.interfaces.LivrableService;
import com.engagement.tm.util.FileUploadUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class LivrableServiceImpl implements LivrableService {

    private final LivrableRepository livrableRepository;
    private final BacklogTacheRepository backlogTacheRepository;
    private final EquipeRepository equipeRepository;
    private final MembreEquipeRepository membreEquipeRepository;
    private final FileUploadUtil fileUploadUtil;

    @Value("${app.upload.path:/app/uploads/livrables}")
    private String uploadDir;

    private void verifierMembreEquipe(Long equipeId, Long stagiaireId) {
        if (!membreEquipeRepository.existsByEquipeIdAndStagiaireId(equipeId, stagiaireId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Vous n'êtes pas membre de cette équipe");
        }
    }

    private BacklogTache verifierTacheExiste(Long equipeId, Long tacheId) {
        BacklogTache tache = backlogTacheRepository.findById(tacheId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Tâche introuvable"));
        if (!tache.getEquipeId().equals(equipeId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Cette tâche n'appartient pas à votre équipe");
        }
        return tache;
    }

    @Override
    @Transactional
    public LivrableResponse soumettreLivrable(Long equipeId, Long tacheId, Long stagiaireId,
                                              LivrableRequest request, MultipartFile fichier) {
        log.info("📤 Soumission d'un livrable pour la tâche {} par stagiaire {}", tacheId, stagiaireId);

        verifierMembreEquipe(equipeId, stagiaireId);
        BacklogTache tache = verifierTacheExiste(equipeId, tacheId);

        // Vérifier qu'au moins un fichier ou un lien est fourni
        if ((fichier == null || fichier.isEmpty()) &&
                (request.getLienURL() == null || request.getLienURL().isBlank())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Un fichier ou un lien URL est obligatoire");
        }

        // Vérifier que le stagiaire est assigné à la tâche
        if (tache.getAssigneId() == null || !tache.getAssigneId().equals(stagiaireId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Vous n'êtes pas assigné à cette tâche");
        }

        // Vérifier que la tâche est démarrée (ou à refaire)
        if (tache.getStatut() != StatutTache.DEMARREE && tache.getStatut() != StatutTache.REFAIRE) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Vous ne pouvez soumettre un livrable que pour une tâche démarrée (statut actuel: " + tache.getStatut() + ")");
        }

        // Sauvegarder le fichier si présent
        String nomFichier = null;
        if (fichier != null && !fichier.isEmpty()) {
            nomFichier = fileUploadUtil.saveLivrableFile(fichier, tacheId, stagiaireId);
        }

        Livrable livrable = Livrable.builder()
                .nomFichier(nomFichier != null ? nomFichier : request.getNomFichier())
                .lienURL(request.getLienURL())
                .description(request.getDescription())
                .tacheId(tacheId)
                .stagiaireId(stagiaireId)
                .equipeId(equipeId)
                .build();

        livrable = livrableRepository.save(livrable);

        // Changer le statut de la tâche à COMPLETEE
        tache.setStatut(StatutTache.COMPLETEE);
        backlogTacheRepository.save(tache);

        log.info("✅ Livrable soumis pour la tâche {}", tacheId);
        return toResponse(livrable);
    }

    @Override
    @Transactional(readOnly = true)
    public List<LivrableResponse> getLivrablesByTache(Long equipeId, Long tacheId) {
        List<Livrable> livrables = livrableRepository.findByTacheId(tacheId);
        return livrables.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public LivrableResponse getDernierLivrable(Long equipeId, Long tacheId) {
        return livrableRepository.findFirstByTacheIdOrderByDateSoumissionDesc(tacheId)
                .map(this::toResponse)
                .orElse(null);
    }

    /**
     * Télécharger un fichier livrable
     */
    @Override
    @Transactional(readOnly = true)
    public byte[] telechargerFichier(String fileName) {
        if (!fileUploadUtil.fileExists(fileName)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Fichier non trouvé");
        }

        try {
            Path filePath = fileUploadUtil.getLivrableFilePath(fileName);
            return Files.readAllBytes(filePath);
        } catch (IOException e) {
            log.error("❌ Erreur lors du téléchargement du fichier: {}", e.getMessage());
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Erreur lors du téléchargement");
        }
    }

    private LivrableResponse toResponse(Livrable livrable) {
        return LivrableResponse.builder()
                .id(livrable.getId())
                .nomFichier(livrable.getNomFichier())
                .lienURL(livrable.getLienURL())
                .description(livrable.getDescription())
                .tacheId(livrable.getTacheId())
                .stagiaireId(livrable.getStagiaireId())
                .dateSoumission(livrable.getDateSoumission())
                .build();
    }
}