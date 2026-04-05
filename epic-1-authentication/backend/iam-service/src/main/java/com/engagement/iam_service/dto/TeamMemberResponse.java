package com.engagement.iam_service.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class TeamMemberResponse {
    private Long id;
    private String email;
    private String firstName;
    private String lastName;
}
