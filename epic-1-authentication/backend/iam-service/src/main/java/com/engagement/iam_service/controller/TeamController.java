package com.engagement.iam_service.controller;

import com.engagement.iam_service.model.Team;
import com.engagement.iam_service.model.User;
import com.engagement.iam_service.model.Role;
import com.engagement.iam_service.repository.TeamRepository;
import com.engagement.iam_service.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/admin/teams")
@RequiredArgsConstructor@SuppressWarnings("null")public class TeamController {

    private final TeamRepository teamRepository;
    private final UserRepository userRepository;

    @GetMapping("/my")
    public ResponseEntity<List<Team>> getMyTeams(@AuthenticationPrincipal User manager) {
        return ResponseEntity.ok(teamRepository.findByManagerId(manager.getId()));
    }

    @PostMapping
    public ResponseEntity<Team> createTeam(@AuthenticationPrincipal User manager, @RequestBody Map<String, String> request) {
        @SuppressWarnings("null")
        Team team = Team.builder()
                .name(request.get("name"))
                .description(request.get("description"))
                .managerId((Long) manager.getId())
                .build();
        @SuppressWarnings("null")
        Team saveTeam = team;
        @SuppressWarnings("null")
        Team savedTeam = teamRepository.save(saveTeam);
        return ResponseEntity.ok(savedTeam);
    }

    @PostMapping("/{id}/add-member")
    public ResponseEntity<?> addMember(@PathVariable Long id, @RequestBody Map<String, Long> request) {
        @SuppressWarnings("null")
        Team team = (Team) teamRepository.findById(id).orElseThrow();
        @SuppressWarnings("null")
        User user = (User) userRepository.findById(request.get("userId")).orElseThrow();
        
        user.setTeam(team);
        @SuppressWarnings("null")
        User saveUser = user;
        userRepository.save(saveUser);
        
        return ResponseEntity.ok(Map.of("message", "Member added to team successfully"));
    }

    @GetMapping("/available-stagiaires")
    public ResponseEntity<List<User>> getAvailableStagiaires() {
        // Return users with role USER who are not in a team yet
        return ResponseEntity.ok(userRepository.findAll().stream()
                .filter(u -> u.getRole() == Role.USER && u.getTeam() == null)
                .toList());
    }
    
    @GetMapping("/{id}/members")
    public ResponseEntity<List<User>> getTeamMembers(@PathVariable Long id) {
        @SuppressWarnings("null")
        Team team = (Team) teamRepository.findById(id).orElseThrow();
        return ResponseEntity.ok(team.getMembers());
    }
}
