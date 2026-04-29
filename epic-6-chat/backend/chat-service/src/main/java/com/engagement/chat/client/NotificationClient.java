package com.engagement.chat.client;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Slf4j
@Component
public class NotificationClient {

    private final RestTemplate restTemplate;
    private final String notificationServiceUrl;

    public NotificationClient(
            RestTemplate restTemplate,
            @Value("${notification.service.url:http://notification-service:8084}") String notificationServiceUrl) {
        this.restTemplate = restTemplate;
        this.notificationServiceUrl = notificationServiceUrl;
    }

    @Async
    public void sendChatNotification(Long userId, String senderName, String messagePreview) {
        try {
            String url = notificationServiceUrl + "/api/notifications";

            String preview = messagePreview.length() > 80
                    ? messagePreview.substring(0, 80) + "..."
                    : messagePreview;

            Map<String, Object> body = Map.of(
                    "userId", userId,
                    "title", "Nouveau message",
                    "message", senderName + " : " + preview,
                    "type", "CHAT"
            );

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);

            restTemplate.postForEntity(url, request, String.class);
            log.debug("Notification sent to user {} for chat message from {}", userId, senderName);
        } catch (Exception e) {
            log.warn("Failed to send chat notification to user {}: {}", userId, e.getMessage());
        }
    }
}
