package com.pfe.teammanagement.controller;

import com.pfe.teammanagement.dto.MemberRequest;
import com.pfe.teammanagement.dto.TeamRequest;
import com.pfe.teammanagement.dto.TeamResponse;
import com.pfe.teammanagement.service.interfaces.TeamService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/teams")
@RequiredArgsConstructor
@Slf4j
public class TeamController {

    private final TeamService teamService;

    private UUID getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String userId = (String) auth.getPrincipal();
        return UUID.fromString(userId);
    }

    private String getCurrentUserRole() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return auth.getAuthorities().stream()
                .findFirst()
                .map(grantedAuthority -> grantedAuthority.getAuthority().replace("ROLE_", ""))
                .orElse("UNKNOWN");
    }

    @PostMapping
    @PreAuthorize("hasRole('ENCADRANT')")
    public ResponseEntity<TeamResponse> createTeam(@Valid @RequestBody TeamRequest request) {
        UUID encadrantId = getCurrentUserId();
        log.info("Création d'équipe par l'encadrant: {}", encadrantId);
        return ResponseEntity.status(HttpStatus.CREATED).body(teamService.createTeam(request, encadrantId));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ENCADRANT', 'STAGIAIRE', 'ADMINISTRATEUR')")
    public ResponseEntity<List<TeamResponse>> getMyTeams() {
        UUID userId = getCurrentUserId();
        String role = getCurrentUserRole();
        log.debug("Récupération des équipes pour userId: {}, role: {}", userId, role);
        return ResponseEntity.ok(teamService.getTeamsByUser(userId, role));
    }

    @GetMapping("/encadrant/{encadrantId}")
    @PreAuthorize("hasAnyRole('ENCADRANT', 'ADMINISTRATEUR')")
    public ResponseEntity<List<TeamResponse>> getTeamsByEncadrant(@PathVariable UUID encadrantId) {
        return ResponseEntity.ok(teamService.getTeamsByEncadrant(encadrantId));
    }

    @GetMapping("/{teamId}")
    @PreAuthorize("hasAnyRole('ENCADRANT', 'STAGIAIRE', 'ADMINISTRATEUR')")
    public ResponseEntity<TeamResponse> getTeamById(@PathVariable UUID teamId) {
        UUID userId = getCurrentUserId();
        String role = getCurrentUserRole();
        return ResponseEntity.ok(teamService.getTeamById(teamId, userId, role));
    }

    @PutMapping("/{teamId}")
    @PreAuthorize("hasRole('ENCADRANT')")
    public ResponseEntity<TeamResponse> updateTeam(
            @PathVariable UUID teamId,
            @Valid @RequestBody TeamRequest request) {
        UUID encadrantId = getCurrentUserId();
        return ResponseEntity.ok(teamService.updateTeam(teamId, request, encadrantId));
    }

    @DeleteMapping("/{teamId}")
    @PreAuthorize("hasRole('ENCADRANT')")
    public ResponseEntity<Void> deleteTeam(@PathVariable UUID teamId) {
        UUID encadrantId = getCurrentUserId();
        teamService.deleteTeam(teamId, encadrantId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{teamId}/members")
    @PreAuthorize("hasRole('ENCADRANT')")
    public ResponseEntity<TeamResponse> addMember(
            @PathVariable UUID teamId,
            @Valid @RequestBody MemberRequest request) {
        UUID encadrantId = getCurrentUserId();
        return ResponseEntity.ok(teamService.addMember(teamId, request.getStagiaireId(), encadrantId));
    }

    @DeleteMapping("/{teamId}/members/{stagiaireId}")
    @PreAuthorize("hasRole('ENCADRANT')")
    public ResponseEntity<TeamResponse> removeMember(
            @PathVariable UUID teamId,
            @PathVariable UUID stagiaireId) {
        UUID encadrantId = getCurrentUserId();
        return ResponseEntity.ok(teamService.removeMember(teamId, stagiaireId, encadrantId));
    }
}