package com.engagement.iam_service.kafka.events;

import com.engagement.iam_service.model.Role;
import com.engagement.iam_service.model.UserStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserRegisteredEvent {
    private String eventId;
    private Instant occurredAt;

    private Long userId;
    private String email;
    private String firstName;
    private String lastName;

    private Role role;
    private UserStatus status;
}
