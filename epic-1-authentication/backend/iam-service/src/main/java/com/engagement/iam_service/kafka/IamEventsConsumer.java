package com.engagement.iam_service.kafka;

import com.engagement.iam_service.kafka.events.UserRegisteredEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@Service
public class IamEventsConsumer {

    private static final Logger log = LoggerFactory.getLogger(IamEventsConsumer.class);

    @KafkaListener(topics = "${appKafka.topics.userRegistered}", groupId = "iam-service")
    public void onUserRegistered(UserRegisteredEvent event) {
        log.info("Consumed UserRegisteredEvent eventId={} email={} role={} status={}",
                event.getEventId(), event.getEmail(), event.getRole(), event.getStatus());
    }
}
