package com.engagement.iam.client;

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
    public void send(Long userId, String title, String message, String type) {
        try {
            String url = notificationServiceUrl + "/api/notifications";
            Map<String, Object> body = Map.of(
                    "userId", userId,
                    "title", title,
                    "message", message,
                    "type", type
            );
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            restTemplate.postForEntity(url, new HttpEntity<>(body, headers), String.class);
            log.debug("Notification envoyée à userId={} : {}", userId, title);
        } catch (Exception e) {
            log.warn("Échec envoi notification à userId={} : {}", userId, e.getMessage());
        }
    }
}
