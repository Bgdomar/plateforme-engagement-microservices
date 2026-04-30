package com.engagement.communication.chat.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "messages")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Message {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long conversationId;

    @Column(nullable = false)
    private Long senderId;

    private String senderName;

    @Column(columnDefinition = "TEXT")
    private String content;

    private String fileUrl;
    private String fileName;
    private String fileType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MessageType type;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    private boolean read;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        read = false;
    }

    public enum MessageType {
        TEXT,
        IMAGE,
        FILE,
        SYSTEM
    }
}
