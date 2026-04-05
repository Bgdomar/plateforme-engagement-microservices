package com.engagement.iam_service.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class TeamResponse {
    private Long id;
    private String name;
    private String description;
    private Long managerId;
    private LocalDateTime createdAt;
    private int membersCount;
    private List<TeamMemberResponse> members;
}
