package com.engagement.chat.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class MessageDTO {
    private Long id;
    private Long conversationId;
    private Long senderId;
    private String senderName;
    private String content;
    private String type;
    private String fileUrl;
    private String fileName;
    private String fileType;
    private LocalDateTime createdAt;
    private boolean read;
}
