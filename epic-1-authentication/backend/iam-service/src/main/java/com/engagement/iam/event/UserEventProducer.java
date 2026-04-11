package com.engagement.iam.event;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class UserEventProducer {

    private final KafkaTemplate<String, UserCreatedEvent> kafkaTemplate;

    // ✅ Corriger le topic pour correspondre au consumer
    private static final String TOPIC = "com.engagement.iam.user.registered";

    public void publishUserCreated(UserCreatedEvent event) {
        kafkaTemplate.send(TOPIC, event.getUserId().toString(), event);
        log.info("📤 Event publié sur {} : userId={}", TOPIC, event.getUserId());
    }
}