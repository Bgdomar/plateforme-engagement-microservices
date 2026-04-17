package com.pfe.teammanagement.service.interfaces;

import com.pfe.teammanagement.dto.TeamRequest;
import com.pfe.teammanagement.dto.TeamResponse;
import java.util.List;
import java.util.UUID;

public interface TeamService {
    TeamResponse createTeam(TeamRequest request, UUID encadrantId);
    List<TeamResponse> getTeamsByUser(UUID userId, String role);
    List<TeamResponse> getTeamsByEncadrant(UUID encadrantId);
    TeamResponse getTeamById(UUID teamId, UUID userId, String role);
    TeamResponse updateTeam(UUID teamId, TeamRequest request, UUID encadrantId);
    void deleteTeam(UUID teamId, UUID encadrantId);
    TeamResponse addMember(UUID teamId, UUID stagiaireId, UUID encadrantId);
    TeamResponse removeMember(UUID teamId, UUID stagiaireId, UUID encadrantId);
}