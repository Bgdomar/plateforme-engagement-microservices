package com.engagement.communication.chat.repository;

import com.engagement.communication.chat.entity.Conversation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ConversationRepository extends JpaRepository<Conversation, Long> {

    @Query("SELECT c FROM Conversation c WHERE :userId MEMBER OF c.participantIds ORDER BY c.updatedAt DESC")
    List<Conversation> findByParticipantId(@Param("userId") Long userId);

    @Query("SELECT c FROM Conversation c WHERE c.type = 'DIRECT' AND :user1 MEMBER OF c.participantIds AND :user2 MEMBER OF c.participantIds")
    Optional<Conversation> findDirectConversation(@Param("user1") Long user1, @Param("user2") Long user2);

    Optional<Conversation> findByTeamId(Long teamId);
}
