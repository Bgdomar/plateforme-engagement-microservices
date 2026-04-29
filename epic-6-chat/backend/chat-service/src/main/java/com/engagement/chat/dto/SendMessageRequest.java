package com.engagement.chat.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class SendMessageRequest {
    @NotNull
    private Long conversationId;
    @NotNull
    private Long senderId;
    private String senderName;
    @NotBlank
    private String content;
}
