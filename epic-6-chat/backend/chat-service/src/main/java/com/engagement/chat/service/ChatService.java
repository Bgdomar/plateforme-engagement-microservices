package com.engagement.chat.service;

import com.engagement.chat.client.NotificationClient;
import com.engagement.chat.dto.*;
import com.engagement.chat.entity.Conversation;
import com.engagement.chat.entity.Message;
import com.engagement.chat.repository.ConversationRepository;
import com.engagement.chat.repository.MessageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final ConversationRepository conversationRepo;
    private final MessageRepository messageRepo;
    private final NotificationClient notificationClient;

    public List<ConversationDTO> getConversations(Long userId) {
        return conversationRepo.findByParticipantId(userId).stream()
                .map(c -> toConversationDTO(c, userId))
                .collect(Collectors.toList());
    }

    @Transactional
    public ConversationDTO createConversation(CreateConversationRequest req) {
        Conversation.ConversationType type = Conversation.ConversationType.valueOf(req.getType());

        if (type == Conversation.ConversationType.DIRECT && req.getParticipantIds().size() == 2) {
            var existing = conversationRepo.findDirectConversation(
                    req.getParticipantIds().get(0), req.getParticipantIds().get(1));
            if (existing.isPresent()) {
                return toConversationDTO(existing.get(), req.getParticipantIds().get(0));
            }
        }

        if (type == Conversation.ConversationType.TEAM && req.getTeamId() != null) {
            var existing = conversationRepo.findByTeamId(req.getTeamId());
            if (existing.isPresent()) {
                return toConversationDTO(existing.get(), req.getParticipantIds().get(0));
            }
        }

        Conversation conv = Conversation.builder()
                .name(req.getName())
                .type(type)
                .teamId(req.getTeamId())
                .participantIds(req.getParticipantIds())
                .build();

        conv = conversationRepo.save(conv);
        return toConversationDTO(conv, req.getParticipantIds().get(0));
    }

    public List<MessageDTO> getMessages(Long conversationId) {
        return messageRepo.findByConversationIdOrderByCreatedAtAsc(conversationId).stream()
                .map(this::toMessageDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public MessageDTO sendMessage(SendMessageRequest req) {
        Message msg = Message.builder()
                .conversationId(req.getConversationId())
                .senderId(req.getSenderId())
                .senderName(req.getSenderName())
                .content(req.getContent())
                .type(Message.MessageType.TEXT)
                .build();

        msg = messageRepo.save(msg);

        // Update conversation timestamp
        conversationRepo.findById(req.getConversationId()).ifPresent(c -> {
            c.setUpdatedAt(java.time.LocalDateTime.now());
            conversationRepo.save(c);

            // Send notification to all participants except the sender
            c.getParticipantIds().stream()
                    .filter(id -> !id.equals(req.getSenderId()))
                    .forEach(participantId -> notificationClient.sendChatNotification(
                            participantId,
                            req.getSenderName() != null ? req.getSenderName() : "Quelqu'un",
                            req.getContent()
                    ));
        });

        return toMessageDTO(msg);
    }

    @Transactional
    public MessageDTO sendFileMessage(Long conversationId, Long senderId, String senderName,
                                       String fileUrl, String fileName, String fileType) {
        Message.MessageType msgType = fileType != null && fileType.startsWith("image/")
                ? Message.MessageType.IMAGE
                : Message.MessageType.FILE;

        String content = msgType == Message.MessageType.IMAGE
                ? "\uD83D\uDCF7 Image"
                : "\uD83D\uDCCE " + fileName;

        Message msg = Message.builder()
                .conversationId(conversationId)
                .senderId(senderId)
                .senderName(senderName)
                .content(content)
                .type(msgType)
                .fileUrl(fileUrl)
                .fileName(fileName)
                .fileType(fileType)
                .build();

        msg = messageRepo.save(msg);

        conversationRepo.findById(conversationId).ifPresent(c -> {
            c.setUpdatedAt(java.time.LocalDateTime.now());
            conversationRepo.save(c);
            c.getParticipantIds().stream()
                    .filter(id -> !id.equals(senderId))
                    .forEach(participantId -> notificationClient.sendChatNotification(
                            participantId,
                            senderName != null ? senderName : "Quelqu'un",
                            content
                    ));
        });

        return toMessageDTO(msg);
    }

    @Transactional
    public void markAsRead(Long conversationId, Long userId) {
        messageRepo.markAsRead(conversationId, userId);
    }

    private ConversationDTO toConversationDTO(Conversation c, Long userId) {
        var lastMsg = messageRepo.findFirstByConversationIdOrderByCreatedAtDesc(c.getId());
        long unread = messageRepo.countUnread(c.getId(), userId);

        return ConversationDTO.builder()
                .id(c.getId())
                .name(c.getName())
                .type(c.getType().name())
                .teamId(c.getTeamId())
                .participantIds(c.getParticipantIds())
                .lastMessage(lastMsg.map(Message::getContent).orElse(null))
                .lastMessageSender(lastMsg.map(Message::getSenderName).orElse(null))
                .lastMessageTime(lastMsg.map(Message::getCreatedAt).orElse(c.getCreatedAt()))
                .unreadCount(unread)
                .createdAt(c.getCreatedAt())
                .build();
    }

    private MessageDTO toMessageDTO(Message m) {
        return MessageDTO.builder()
                .id(m.getId())
                .conversationId(m.getConversationId())
                .senderId(m.getSenderId())
                .senderName(m.getSenderName())
                .content(m.getContent())
                .type(m.getType().name())
                .fileUrl(m.getFileUrl())
                .fileName(m.getFileName())
                .fileType(m.getFileType())
                .createdAt(m.getCreatedAt())
                .read(m.isRead())
                .build();
    }
}
