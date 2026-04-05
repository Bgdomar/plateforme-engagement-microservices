package com.engagement.iam_service.kafka;

import com.engagement.iam_service.kafka.events.UserRegisteredEvent;
import com.engagement.iam_service.model.User;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class IamEventPublisher {

    private static final Logger log = LoggerFactory.getLogger(IamEventPublisher.class);

    private final KafkaTemplate<String, Object> kafkaTemplate;

    @Value("${appKafka.topics.userRegistered}")
    private String userRegisteredTopic;

    public void publishUserRegistered(User user) {
        UserRegisteredEvent event = UserRegisteredEvent.builder()
                .eventId(UUID.randomUUID().toString())
                .occurredAt(Instant.now())
                .userId(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .role(user.getRole())
                .status(user.getStatus())
                .build();

        kafkaTemplate.send(userRegisteredTopic, user.getEmail(), event);
        log.info("Published UserRegisteredEvent to topic={} email={}", userRegisteredTopic, user.getEmail());
    }
}
