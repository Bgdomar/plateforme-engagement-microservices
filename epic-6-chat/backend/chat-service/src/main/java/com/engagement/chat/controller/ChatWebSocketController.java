package com.engagement.chat.controller;

import com.engagement.chat.dto.MessageDTO;
import com.engagement.chat.dto.SendMessageRequest;
import com.engagement.chat.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
public class ChatWebSocketController {

    private final ChatService chatService;
    private final SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/chat.send")
    public void sendMessage(@Payload SendMessageRequest request) {
        MessageDTO saved = chatService.sendMessage(request);
        messagingTemplate.convertAndSend(
                "/topic/conversation." + request.getConversationId(),
                saved
        );
    }

    @MessageMapping("/chat.typing")
    public void typing(@Payload TypingPayload payload) {
        messagingTemplate.convertAndSend(
                "/topic/conversation." + payload.conversationId + ".typing",
                payload
        );
    }

    public record TypingPayload(Long conversationId, Long userId, String userName, boolean typing) {}
}
