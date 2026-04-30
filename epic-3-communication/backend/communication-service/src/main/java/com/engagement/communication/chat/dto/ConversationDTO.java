package com.engagement.communication.chat.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class ConversationDTO {
    private Long id;
    private String name;
    private String type;
    private Long teamId;
    private List<Long> participantIds;
    private String lastMessage;
    private String lastMessageSender;
    private LocalDateTime lastMessageTime;
    private long unreadCount;
    private LocalDateTime createdAt;
}
