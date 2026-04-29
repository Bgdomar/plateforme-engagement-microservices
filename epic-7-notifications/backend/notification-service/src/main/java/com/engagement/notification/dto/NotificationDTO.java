package com.engagement.notification.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class NotificationDTO {
    private Long id;
    private Long userId;
    private String title;
    private String message;
    private String type;
    private boolean read;
    private String link;
    private LocalDateTime createdAt;
}
