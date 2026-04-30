package com.engagement.communication.notification.service;

import com.engagement.communication.notification.dto.CreateNotificationRequest;
import com.engagement.communication.notification.dto.NotificationDTO;
import com.engagement.communication.notification.entity.Notification;
import com.engagement.communication.notification.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepo;

    public List<NotificationDTO> getUserNotifications(Long userId) {
        return notificationRepo.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public long getUnreadCount(Long userId) {
        return notificationRepo.countUnreadByUserId(userId);
    }

    @Transactional
    public NotificationDTO createNotification(CreateNotificationRequest req) {
        Notification notif = Notification.builder()
                .userId(req.getUserId())
                .title(req.getTitle())
                .message(req.getMessage())
                .type(Notification.NotificationType.valueOf(req.getType()))
                .link(req.getLink())
                .build();

        notif = notificationRepo.save(notif);
        return toDTO(notif);
    }

    @Transactional
    public void markAsRead(Long notificationId, Long userId) {
        notificationRepo.markAsRead(notificationId, userId);
    }

    @Transactional
    public void markAllAsRead(Long userId) {
        notificationRepo.markAllAsRead(userId);
    }

    private NotificationDTO toDTO(Notification n) {
        return NotificationDTO.builder()
                .id(n.getId())
                .userId(n.getUserId())
                .title(n.getTitle())
                .message(n.getMessage())
                .type(n.getType().name())
                .read(n.isRead())
                .link(n.getLink())
                .createdAt(n.getCreatedAt())
                .build();
    }
}
