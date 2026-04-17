package com.engagement.identity.service.implementation;

import com.engagement.identity.dto.LoginRequest;
import com.engagement.identity.dto.LoginResponse;
import com.engagement.identity.dto.ResetPasswordRequest;
import com.engagement.identity.entity.Utilisateur;
import com.engagement.identity.entity.enums.StatutCompte;
import com.engagement.identity.repository.UtilisateurRepository;
import com.engagement.identity.security.JwtUtil;
import com.engagement.identity.service.interfaces.AuthService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthServiceImpl implements AuthService {

    private final UtilisateurRepository utilisateurRepo;
    private final BCryptPasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    @Override
    public LoginResponse login(LoginRequest request) {
        Utilisateur user = utilisateurRepo
                .findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Email ou mot de passe incorrect"));

        if (!passwordEncoder.matches(request.getMotDePasse(), user.getMotDePasse())) {
            throw new RuntimeException("Email ou mot de passe incorrect");
        }

        validateAccountStatus(user);

        String role = user.getTypeCompte().name();
        String token = jwtUtil.generateToken(
                user.getEmail(),
                role,
                user.getId().toString()
        );

        log.info("✅ Connexion réussie : {} ({})", user.getEmail(), role);

        return buildLoginResponse(token, role, user);
    }

    @Override
    public LoginResponse facialLogin(String identifier) {
        Utilisateur user;
        try {
            UUID uuid = UUID.fromString(identifier);
            user = utilisateurRepo.findById(uuid)
                    .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));
        } catch (IllegalArgumentException e) {
            user = utilisateurRepo.findByEmail(identifier)
                    .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));
        }

        validateAccountStatus(user);

        String role = user.getTypeCompte().name();
        String token = jwtUtil.generateToken(
                user.getEmail(),
                role,
                user.getId().toString()
        );

        log.info("✅ Facial login réussi : {} ({})", user.getEmail(), role);

        return buildLoginResponse(token, role, user);
    }

    @Override
    public void resetPassword(ResetPasswordRequest request) {
        if (request.getEmail() == null || request.getEmail().isBlank()) {
            throw new RuntimeException("Email requis");
        }

        if (request.getNouveauMotDePasse() == null || request.getNouveauMotDePasse().length() < 6) {
            throw new RuntimeException("Le mot de passe doit contenir au moins 6 caractères");
        }

        Utilisateur user = utilisateurRepo.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Aucun compte associé à cet email"));

        user.setMotDePasse(passwordEncoder.encode(request.getNouveauMotDePasse()));
        utilisateurRepo.save(user);

        log.info("✅ Mot de passe réinitialisé pour : {}", user.getEmail());
    }

    private void validateAccountStatus(Utilisateur user) {
        switch (user.getStatut()) {
            case EN_ATTENTE:
                throw new RuntimeException("Votre compte est en attente de validation par l'administrateur.");
            case DESACTIVE:
                throw new RuntimeException("Votre compte a été désactivé. Veuillez contacter l'administrateur.");
            case SUSPENDU:
                throw new RuntimeException("Votre compte est temporairement suspendu.");
            case ACTIF:
                break;
            default:
                throw new RuntimeException("Statut de compte non reconnu.");
        }
    }

    private String getRedirectUrlByRole(String role) {
        return switch (role) {
            case "ADMINISTRATEUR" -> "/dashboard/admin";
            case "ENCADRANT" -> "/dashboard/encadrant";
            default -> "/dashboard/stagiaire";
        };
    }

    private LoginResponse buildLoginResponse(String token, String role, Utilisateur user) {
        return LoginResponse.builder()
                .token(token)
                .role(role)
                .userId(user.getId())
                .email(user.getEmail())
                .redirectUrl(getRedirectUrlByRole(role))
                .build();
    }
}
