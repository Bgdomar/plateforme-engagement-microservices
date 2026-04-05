package com.engagement.iam_service.service;

import com.engagement.iam_service.dto.AddMembersRequest;
import com.engagement.iam_service.dto.CreateTeamRequest;
import com.engagement.iam_service.dto.TeamMemberResponse;
import com.engagement.iam_service.dto.TeamResponse;
import com.engagement.iam_service.model.Role;
import com.engagement.iam_service.model.Team;
import com.engagement.iam_service.model.User;
import com.engagement.iam_service.repository.TeamRepository;
import com.engagement.iam_service.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class TeamService {

    private final TeamRepository teamRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<TeamResponse> getMyTeams(String managerEmail) {
        User manager = userRepository.findByEmail(managerEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return teamRepository.findByManagerId(manager.getId())
                .stream()
                .sorted(Comparator.comparing(Team::getId))
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public TeamResponse createTeam(String managerEmail, CreateTeamRequest request) {
        if (request == null || request.getName() == null || request.getName().isBlank()) {
            throw new RuntimeException("Team name is required");
        }

        User manager = userRepository.findByEmail(managerEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Team team = Team.builder()
                .name(request.getName().trim())
                .description(request.getDescription())
                .managerId(manager.getId())
                .build();

        Team saved = teamRepository.save(team);
        return toResponse(saved);
    }

    @Transactional
    public TeamResponse addMembers(String managerEmail, Long teamId, AddMembersRequest request) {
        if (teamId == null || teamId <= 0) {
            throw new RuntimeException("Team not found");
        }
        if (request == null || request.getUserIds() == null || request.getUserIds().isEmpty()) {
            throw new RuntimeException("userIds is required");
        }

        User manager = userRepository.findByEmail(managerEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new RuntimeException("Team not found"));

        if (!Objects.equals(team.getManagerId(), manager.getId())) {
            throw new RuntimeException("Forbidden");
        }

        List<User> users = userRepository.findAllById(request.getUserIds());
        for (User u : users) {
            if (u == null) {
                continue;
            }
            if (u.getRole() != Role.USER) {
                continue;
            }
            if (u.getTeam() != null) {
                continue;
            }
            u.setTeam(team);
        }
        userRepository.saveAll(users);

        Team refreshed = teamRepository.findById(teamId)
                .orElseThrow(() -> new RuntimeException("Team not found"));
        return toResponse(refreshed);
    }

    @Transactional(readOnly = true)
    public List<TeamMemberResponse> getAvailableStagiaires() {
        return userRepository.findAll().stream()
                .filter(u -> u.getRole() == Role.USER && u.getTeam() == null)
                .map(this::toMember)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<TeamMemberResponse> getTeamMembers(String managerEmail, Long teamId) {
        if (teamId == null || teamId <= 0) {
            throw new RuntimeException("Team not found");
        }

        User manager = userRepository.findByEmail(managerEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new RuntimeException("Team not found"));

        if (!Objects.equals(team.getManagerId(), manager.getId())) {
            throw new RuntimeException("Forbidden");
        }

        if (team.getMembers() == null) {
            return List.of();
        }

        return team.getMembers().stream().map(this::toMember).toList();
    }

    private TeamResponse toResponse(Team team) {
        List<TeamMemberResponse> members = team.getMembers() == null
                ? List.of()
                : team.getMembers().stream().map(this::toMember).toList();

        return TeamResponse.builder()
                .id(team.getId())
                .name(team.getName())
                .description(team.getDescription())
                .managerId(team.getManagerId())
                .createdAt(team.getCreatedAt())
                .membersCount(members.size())
                .members(members)
                .build();
    }

    private TeamMemberResponse toMember(User u) {
        return TeamMemberResponse.builder()
                .id(u.getId())
                .email(u.getEmail())
                .firstName(u.getFirstName())
                .lastName(u.getLastName())
                .build();
    }
}
