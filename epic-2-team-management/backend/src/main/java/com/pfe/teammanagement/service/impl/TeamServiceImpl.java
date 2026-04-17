package com.pfe.teammanagement.service.impl;

import com.pfe.teammanagement.dto.TeamRequest;
import com.pfe.teammanagement.dto.TeamResponse;
import com.pfe.teammanagement.entity.Equipe;
import com.pfe.teammanagement.entity.MembreEquipe;
import com.pfe.teammanagement.repository.EquipeRepository;
import com.pfe.teammanagement.repository.MembreEquipeRepository;
import com.pfe.teammanagement.service.interfaces.TeamService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class TeamServiceImpl implements TeamService {

    private final EquipeRepository equipeRepository;
    private final MembreEquipeRepository membreEquipeRepository;

    @Override
    @Transactional
    public TeamResponse createTeam(TeamRequest request, UUID encadrantId) {
        log.info("Création d'une équipe par l'encadrant: {}", encadrantId);

        if (equipeRepository.existsByEncadrantIdAndNom(encadrantId, request.getNom())) {
            throw new RuntimeException("Une équipe avec ce nom existe déjà pour cet encadrant");
        }

        Equipe equipe = Equipe.builder()
                .nom(request.getNom())
                .sujet(request.getSujet())
                .encadrantId(encadrantId)
                .build();

        equipe = equipeRepository.save(equipe);

        if (request.getMembresIds() != null) {
            for (UUID stagiaireId : request.getMembresIds()) {
                addMemberToEquipe(equipe, stagiaireId);
            }
        }

        log.info("Équipe créée avec succès: {} - ID: {}", equipe.getNom(), equipe.getId());
        return buildTeamResponse(equipe, null);
    }

    @Override
    public List<TeamResponse> getTeamsByUser(UUID userId, String role) {
        log.debug("Récupération des équipes pour l'utilisateur: {} avec rôle: {}", userId, role);

        List<Equipe> equipes;
        if ("ENCADRANT".equals(role)) {
            equipes = equipeRepository.findByEncadrantId(userId);
        } else if ("STAGIAIRE".equals(role)) {
            equipes = equipeRepository.findEquipesByStagiaireId(userId);
        } else {
            equipes = equipeRepository.findAll();
        }

        return equipes.stream()
                .map(equipe -> buildTeamResponse(equipe, null))
                .collect(Collectors.toList());
    }

    @Override
    public List<TeamResponse> getTeamsByEncadrant(UUID encadrantId) {
        return equipeRepository.findByEncadrantId(encadrantId).stream()
                .map(equipe -> buildTeamResponse(equipe, null))
                .collect(Collectors.toList());
    }

    @Override
    public TeamResponse getTeamById(UUID teamId, UUID userId, String role) {
        Equipe equipe = equipeRepository.findById(teamId)
                .orElseThrow(() -> new RuntimeException("Équipe non trouvée avec l'ID: " + teamId));

        if ("ENCADRANT".equals(role) && !equipe.getEncadrantId().equals(userId)) {
            throw new RuntimeException("Vous n'êtes pas autorisé à voir cette équipe");
        } else if ("STAGIAIRE".equals(role)) {
            boolean isMember = equipe.getMembres().stream()
                    .anyMatch(m -> m.getStagiaireId().equals(userId));
            if (!isMember) {
                throw new RuntimeException("Vous n'êtes pas membre de cette équipe");
            }
        }

        return buildTeamResponse(equipe, null);
    }

    @Override
    @Transactional
    public TeamResponse updateTeam(UUID teamId, TeamRequest request, UUID encadrantId) {
        log.info("Mise à jour de l'équipe: {} par l'encadrant: {}", teamId, encadrantId);

        Equipe equipe = equipeRepository.findByIdAndEncadrantId(teamId, encadrantId)
                .orElseThrow(() -> new RuntimeException("Équipe non trouvée ou vous n'êtes pas autorisé"));

        if (!equipe.getNom().equals(request.getNom()) &&
                equipeRepository.existsByEncadrantIdAndNom(encadrantId, request.getNom())) {
            throw new RuntimeException("Une équipe avec ce nom existe déjà");
        }

        equipe.setNom(request.getNom());
        equipe.setSujet(request.getSujet());
        equipe = equipeRepository.save(equipe);

        log.info("Équipe mise à jour avec succès: {}", equipe.getId());
        return buildTeamResponse(equipe, null);
    }

    @Override
    @Transactional
    public void deleteTeam(UUID teamId, UUID encadrantId) {
        log.info("Suppression de l'équipe: {} par l'encadrant: {}", teamId, encadrantId);

        Equipe equipe = equipeRepository.findByIdAndEncadrantId(teamId, encadrantId)
                .orElseThrow(() -> new RuntimeException("Équipe non trouvée ou vous n'êtes pas autorisé"));

        membreEquipeRepository.deleteByEquipeId(teamId);
        equipeRepository.delete(equipe);

        log.info("Équipe supprimée avec succès: {}", teamId);
    }

    @Override
    @Transactional
    public TeamResponse addMember(UUID teamId, UUID stagiaireId, UUID encadrantId) {
        log.info("Ajout du stagiaire: {} à l'équipe: {} par l'encadrant: {}", stagiaireId, teamId, encadrantId);

        Equipe equipe = equipeRepository.findByIdAndEncadrantId(teamId, encadrantId)
                .orElseThrow(() -> new RuntimeException("Équipe non trouvée ou vous n'êtes pas autorisé"));

        if (membreEquipeRepository.findByEquipeIdAndStagiaireId(teamId, stagiaireId).isPresent()) {
            throw new RuntimeException("Ce stagiaire est déjà membre de l'équipe");
        }

        addMemberToEquipe(equipe, stagiaireId);

        log.info("Stagiaire ajouté avec succès à l'équipe: {}", teamId);
        return buildTeamResponse(equipe, null);
    }

    @Override
    @Transactional
    public TeamResponse removeMember(UUID teamId, UUID stagiaireId, UUID encadrantId) {
        log.info("Suppression du stagiaire: {} de l'équipe: {} par l'encadrant: {}", stagiaireId, teamId, encadrantId);

        Equipe equipe = equipeRepository.findByIdAndEncadrantId(teamId, encadrantId)
                .orElseThrow(() -> new RuntimeException("Équipe non trouvée ou vous n'êtes pas autorisé"));

        membreEquipeRepository.deleteByEquipeIdAndStagiaireId(teamId, stagiaireId);

        log.info("Stagiaire supprimé avec succès de l'équipe: {}", teamId);
        return buildTeamResponse(equipe, null);
    }


    private void addMemberToEquipe(Equipe equipe, UUID stagiaireId) {
        MembreEquipe membre = MembreEquipe.builder()
                .equipe(equipe)
                .stagiaireId(stagiaireId)
                .build();
        equipe.getMembres().add(membre);
        membreEquipeRepository.save(membre);
    }

    private TeamResponse buildTeamResponse(Equipe equipe, String token) {
        TeamResponse response = TeamResponse.builder()
                .id(equipe.getId())
                .nom(equipe.getNom())
                .sujet(equipe.getSujet())
                .encadrantId(equipe.getEncadrantId())
                .dateCreation(equipe.getDateCreation())
                .nombreMembres(equipe.getMembres().size())
                .build();

        List<TeamResponse.MembreResponse> membres = equipe.getMembres().stream()
                .map(membre -> TeamResponse.MembreResponse.builder()
                        .id(membre.getId())
                        .stagiaireId(membre.getStagiaireId())
                        .dateAjout(membre.getDateAjout())
                        .build())
                .collect(Collectors.toList());

        response.setMembres(membres);
        return response;
    }
}