package com.engagement.iam_service.controller;

import com.engagement.iam_service.dto.AddMembersRequest;
import com.engagement.iam_service.dto.CreateTeamRequest;
import com.engagement.iam_service.dto.TeamMemberResponse;
import com.engagement.iam_service.dto.TeamResponse;
import com.engagement.iam_service.service.TeamService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/teams")
@RequiredArgsConstructor
public class TeamsController {

    private final TeamService teamService;

    @GetMapping("/my")
    public ResponseEntity<List<TeamResponse>> myTeams(Authentication authentication) {
        return ResponseEntity.ok(teamService.getMyTeams(authentication.getName()));
    }

    @PostMapping
    public ResponseEntity<TeamResponse> createTeam(Authentication authentication, @RequestBody CreateTeamRequest request) {
        return ResponseEntity.ok(teamService.createTeam(authentication.getName(), request));
    }

    @PostMapping("/{teamId}/members")
    public ResponseEntity<TeamResponse> addMembers(
            Authentication authentication,
            @PathVariable Long teamId,
            @RequestBody AddMembersRequest request
    ) {
        return ResponseEntity.ok(teamService.addMembers(authentication.getName(), teamId, request));
    }

    @GetMapping("/available-stagiaires")
    public ResponseEntity<List<TeamMemberResponse>> availableStagiaires() {
        return ResponseEntity.ok(teamService.getAvailableStagiaires());
    }

    @GetMapping("/{teamId}/members")
    public ResponseEntity<List<TeamMemberResponse>> teamMembers(Authentication authentication, @PathVariable Long teamId) {
        return ResponseEntity.ok(teamService.getTeamMembers(authentication.getName(), teamId));
    }
}
