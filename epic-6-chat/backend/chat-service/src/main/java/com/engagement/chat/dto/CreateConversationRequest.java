package com.engagement.chat.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class CreateConversationRequest {
    private String name;
    @NotNull
    private String type; // DIRECT or TEAM
    private Long teamId;
    @NotNull
    private List<Long> participantIds;
}
