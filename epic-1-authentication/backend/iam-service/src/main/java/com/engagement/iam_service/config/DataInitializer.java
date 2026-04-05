package com.engagement.iam_service.config;

import com.engagement.iam_service.model.Role;
import com.engagement.iam_service.model.User;
import com.engagement.iam_service.model.UserStatus;
import com.engagement.iam_service.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;
import java.util.Objects;

@Configuration
@RequiredArgsConstructor
@Slf4j
@SuppressWarnings("null")
public class DataInitializer {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Bean
    public CommandLineRunner initData() {
        return args -> {
            // Fix or Create Admin
            userRepository.findByEmail("admin@admin.com").ifPresentOrElse(
                admin -> {
                    if (admin.getStatus() != UserStatus.APPROVED) {
                        log.info("Repairing admin account status to APPROVED");
                        admin.setStatus(UserStatus.APPROVED);
                        admin.setRole(Role.ADMIN);
                        @SuppressWarnings("null")
                        User updateAdmin = (User) admin;
                        userRepository.save(updateAdmin);
                    }
                },
                () -> {
                    log.info("Creating default admin account");
                    @SuppressWarnings("null")
                    User admin = User.builder()
                        .email("admin@admin.com")
                        .password(passwordEncoder.encode("admin"))
                        .firstName("Admin")
                        .lastName("DXC")
                        .role(Role.ADMIN)
                        .status(UserStatus.APPROVED)
                        .build();
                    @SuppressWarnings("null")
                    User ad = (User) admin;
                    Objects.requireNonNull(ad);
                    userRepository.save(ad);
                }
            );

            // Fix or Create Omar (to resolve the 404 in biometric login)
            if (userRepository.findByEmail("omar@test.com").isEmpty()) {
                log.info("Creating omar@test.com account to match AI records");
                @SuppressWarnings("null")
                User omar = User.builder()
                    .email("omar@test.com")
                    .password(passwordEncoder.encode("omar"))
                    .firstName("Omar")
                    .lastName("Test")
                    .role(Role.USER)
                    .status(UserStatus.APPROVED)
                    .build();
                @SuppressWarnings("null")
                User om = (User) omar;
                Objects.requireNonNull(om);
                userRepository.save(om);
            }
        };
    }
}
