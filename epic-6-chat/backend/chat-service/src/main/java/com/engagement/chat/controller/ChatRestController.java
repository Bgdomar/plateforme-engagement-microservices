package com.engagement.chat.controller;

import com.engagement.chat.dto.*;
import com.engagement.chat.service.ChatService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatRestController {

    private final ChatService chatService;

    @GetMapping("/conversations")
    public ResponseEntity<List<ConversationDTO>> getConversations(@RequestParam Long userId) {
        return ResponseEntity.ok(chatService.getConversations(userId));
    }

    @PostMapping("/conversations")
    public ResponseEntity<ConversationDTO> createConversation(@Valid @RequestBody CreateConversationRequest req) {
        return ResponseEntity.ok(chatService.createConversation(req));
    }

    @GetMapping("/messages/{conversationId}")
    public ResponseEntity<List<MessageDTO>> getMessages(@PathVariable Long conversationId) {
        return ResponseEntity.ok(chatService.getMessages(conversationId));
    }

    @PostMapping("/messages")
    public ResponseEntity<MessageDTO> sendMessage(@Valid @RequestBody SendMessageRequest req) {
        return ResponseEntity.ok(chatService.sendMessage(req));
    }

    @PostMapping("/messages/read")
    public ResponseEntity<Void> markAsRead(@RequestParam Long conversationId, @RequestParam Long userId) {
        chatService.markAsRead(conversationId, userId);
        return ResponseEntity.ok().build();
    }

    @PostMapping(value = "/messages/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<MessageDTO> uploadFile(
            @RequestParam Long conversationId,
            @RequestParam Long senderId,
            @RequestParam(required = false) String senderName,
            @RequestPart("file") MultipartFile file) throws IOException {

        String originalName = file.getOriginalFilename() != null ? file.getOriginalFilename() : "file";
        String ext = originalName.contains(".") ? originalName.substring(originalName.lastIndexOf(".")) : "";
        String storedName = UUID.randomUUID() + ext;

        Path uploadDir = Paths.get("/app/uploads/chat");
        Files.createDirectories(uploadDir);
        Files.copy(file.getInputStream(), uploadDir.resolve(storedName), StandardCopyOption.REPLACE_EXISTING);

        String fileUrl = "/uploads/chat/" + storedName;
        String fileType = file.getContentType() != null ? file.getContentType() : "application/octet-stream";

        MessageDTO msg = chatService.sendFileMessage(
                conversationId, senderId, senderName, fileUrl, originalName, fileType);

        return ResponseEntity.ok(msg);
    }
}
