package com.engagement.iam_service.service;

import com.engagement.iam_service.dto.AuthResponse;
import com.engagement.iam_service.dto.LoginRequest;
import com.engagement.iam_service.dto.RegisterRequest;
import com.engagement.iam_service.kafka.IamEventPublisher;
import com.engagement.iam_service.model.Role;
import com.engagement.iam_service.model.User;
import com.engagement.iam_service.repository.UserRepository;
import com.engagement.iam_service.security.JwtService;
import com.engagement.iam_service.model.UserStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.Objects;

@Service
@RequiredArgsConstructor
@SuppressWarnings("null")
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final IamEventPublisher iamEventPublisher;

    @Value("${iam.auto-approve:false}")
    private boolean autoApprove;

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email already exists");
        }

        Role requestedRole = request.getRole();
        Role role = (requestedRole == Role.ORGANIZATION) ? Role.ORGANIZATION : Role.USER;

        @SuppressWarnings("null")
        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .educationLevel(request.getEducationLevel())
                .school(request.getSchool())
                .birthDate(request.getBirthDate())
                .faceRegistered(false)
                .role(role)
                .status(autoApprove ? UserStatus.APPROVED : UserStatus.PENDING)
                .build();

        Objects.requireNonNull(user);
        userRepository.save(user);
        iamEventPublisher.publishUserRegistered(user);
        @SuppressWarnings("null")
        User jwtReg = user;
        var jwtToken = jwtService.generateToken(jwtReg);

        return AuthResponse.builder()
                .message(autoApprove
                        ? "User registered successfully. Account is approved."
                        : "User registered successfully. Account is pending approval.")
                .email(user.getEmail())
                .token(jwtToken) 
                .role(user.getRole())
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Email ou mot de passe incorrect"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Email ou mot de passe incorrect");
        }

        validateAccountStatus(user);

        var jwtToken = jwtService.generateToken(user);

        return AuthResponse.builder()
                .message("Login successful")
                .email(user.getEmail())
                .token(jwtToken)
                .role(user.getRole())
                .build();
    }

    private void validateAccountStatus(User user) {
        UserStatus status = user.getStatus();

        if (status == null) {
            throw new RuntimeException("Statut de compte non reconnu. Contactez l'administrateur.");
        }

        switch (status) {
            case APPROVED -> {
            }
            case PENDING -> throw new RuntimeException(
                    "Votre compte est en attente de validation par l'administrateur. Vous recevrez un email de confirmation une fois validé."
            );
            case REJECTED -> throw new RuntimeException(
                    "Votre compte a été rejeté. Veuillez contacter l'administrateur pour plus d'informations."
            );
            case SUSPENDED -> throw new RuntimeException(
                    "Votre compte est temporairement suspendu. Veuillez contacter l'administrateur."
            );
            default -> throw new RuntimeException("Statut de compte non reconnu. Contactez l'administrateur.");
        }
    }

    public AuthResponse biometricLogin(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found for biometric login"));

        validateAccountStatus(user);

        // If AI service identified the user, their face is registered — auto-set the flag
        if (!user.isFaceRegistered()) {
            user.setFaceRegistered(true);
            userRepository.save(user);
        }

        var jwtToken = jwtService.generateToken(user);

        return AuthResponse.builder()
                .message("Biometric login successful")
                .email(user.getEmail())
                .token(jwtToken)
                .role(user.getRole())
                .build();
    }
}
