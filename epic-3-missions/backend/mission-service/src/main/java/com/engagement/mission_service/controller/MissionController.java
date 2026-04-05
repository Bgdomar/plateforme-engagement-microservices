package com.engagement.mission_service.controller;

import com.engagement.mission_service.model.Mission;
import com.engagement.mission_service.model.MissionStatus;
import com.engagement.mission_service.repository.MissionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/missions")
@RequiredArgsConstructor
@SuppressWarnings("null")
public class MissionController {

    private final MissionRepository missionRepository;

    @PostMapping
    public ResponseEntity<Mission> createMission(@RequestBody Mission mission) {
        // Assume managerId comes from the authenticated user context or is passed
        @SuppressWarnings("null")
        Mission tempMission = mission;
        @SuppressWarnings("null")
        Mission savedMission = (Mission) missionRepository.save(tempMission);
        return ResponseEntity.ok(savedMission);
    }

    @GetMapping
    public ResponseEntity<List<Mission>> getAllMissions() {
        return ResponseEntity.ok(missionRepository.findAll());
    }

    @GetMapping("/team/{teamId}")
    public ResponseEntity<List<Mission>> getTeamMissions(@PathVariable Long teamId) {
        return ResponseEntity.ok(missionRepository.findByTeamId(teamId));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Mission> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> request) {
        @SuppressWarnings("null")
        Long finalId = (Long) id;
        @SuppressWarnings("null")
        Mission mission = (Mission) missionRepository.findById(finalId).orElseThrow();
        mission.setStatus(MissionStatus.valueOf(request.get("status")));
        @SuppressWarnings("null")
        Mission statusUpdatedMission = mission;
        return ResponseEntity.ok(missionRepository.save(statusUpdatedMission));
    }

    @GetMapping("/my-team")
    public ResponseEntity<List<Mission>> getMyTeamMissions(@RequestParam Long teamId) {
        return ResponseEntity.ok(missionRepository.findByTeamId(teamId));
    }
}
