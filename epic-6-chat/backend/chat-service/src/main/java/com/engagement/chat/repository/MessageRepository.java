package com.engagement.chat.repository;

import com.engagement.chat.entity.Message;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface MessageRepository extends JpaRepository<Message, Long> {

    Page<Message> findByConversationIdOrderByCreatedAtDesc(Long conversationId, Pageable pageable);

    List<Message> findByConversationIdOrderByCreatedAtAsc(Long conversationId);

    Optional<Message> findFirstByConversationIdOrderByCreatedAtDesc(Long conversationId);

    @Query("SELECT COUNT(m) FROM Message m WHERE m.conversationId = :convId AND m.senderId <> :userId AND m.read = false")
    long countUnread(@Param("convId") Long conversationId, @Param("userId") Long userId);

    @Modifying
    @Query("UPDATE Message m SET m.read = true WHERE m.conversationId = :convId AND m.senderId <> :userId AND m.read = false")
    void markAsRead(@Param("convId") Long conversationId, @Param("userId") Long userId);
}
