package com.engagement.iam.service.implimentaion;

import com.engagement.iam.dto.LoginRequest;
import com.engagement.iam.dto.LoginResponse;
import com.engagement.iam.entity.Utilisateur;
import com.engagement.iam.repository.UtilisateurRepository;
import com.engagement.iam.security.JwtUtil;
import com.engagement.iam.service.interfaces.AuthService;
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

        // 1. Vérifier si l'utilisateur existe
        Utilisateur user = utilisateurRepo
                .findByEmail(request.getEmail())
                .orElse(null);

        // 2. Si l'utilisateur n'existe pas
        if (user == null) {
            log.warn("❌ Tentative de connexion avec email inexistant: {}", request.getEmail());
            throw new RuntimeException("Email ou mot de passe incorrect");
        }

        // 3. Vérifier le mot de passe
        if (!passwordEncoder.matches(request.getMotDePasse(), user.getMotDePasse())) {
            log.warn("❌ Tentative de connexion avec mot de passe incorrect pour: {}", user.getEmail());
            throw new RuntimeException("Email ou mot de passe incorrect");
        }

        // 4. Vérifier le statut du compte avec messages spécifiques
        validateAccountStatus(user);

        // 5. Générer le token JWT
        String role = user.getTypeCompte().name();
        String token = jwtUtil.generateToken(
                user.getEmail(),
                role,
                user.getId().toString()
        );

        // 6. Déterminer la redirection selon le rôle
        String redirectUrl = getRedirectUrlByRole(role);

        log.info("✅ Connexion réussie : {} ({})", user.getEmail(), role);

        return buildLoginResponse(token, role, user);
    }

    @Override
    public LoginResponse facialLogin(String userId) {

        // 1. Chercher l'utilisateur par UUID
        Utilisateur user = utilisateurRepo
                .findById(UUID.fromString(userId))
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));

        // 2. Vérifier le statut du compte
        validateAccountStatus(user);

        // 3. Générer le token JWT
        String role = user.getTypeCompte().name();
        String token = jwtUtil.generateToken(
                user.getEmail(),
                role,
                user.getId().toString()
        );

        log.info("✅ Facial login réussi : {} ({})", user.getEmail(), role);

        return buildLoginResponse(token, role, user);
    }

    /**
     * Validate user account status and throw appropriate exception if not ACTIVE
     * @param user Utilisateur to validate
     * @throws RuntimeException if account status is not ACTIVE
     */
    private void validateAccountStatus(Utilisateur user) {
        switch (user.getStatut()) {
            case EN_ATTENTE:
                log.warn("❌ Tentative de connexion d'un compte en attente: {}", user.getEmail());
                throw new RuntimeException("Votre compte est en attente de validation par l'administrateur. Vous recevrez un email de confirmation une fois validé.");

            case DESACTIVE:
                log.warn("❌ Tentative de connexion d'un compte désactivé: {}", user.getEmail());
                throw new RuntimeException("Votre compte a été désactivé. Veuillez contacter l'administrateur pour plus d'informations.");

            case SUSPENDU:
                log.warn("❌ Tentative de connexion d'un compte suspendu: {}", user.getEmail());
                throw new RuntimeException("Votre compte est temporairement suspendu. Veuillez contacter l'administrateur.");

            case ACTIF:
                log.info("✅ Compte actif, connexion autorisée: {}", user.getEmail());
                break;

            default:
                log.warn("❌ Tentative de connexion avec statut inconnu: {}", user.getStatut());
                throw new RuntimeException("Statut de compte non reconnu. Contactez l'administrateur.");
        }
    }

    /**
     * Get redirect URL based on user role
     * @param role User role (ADMIN, ENCADRANT, STAGIAIRE)
     * @return Redirect URL path
     */
    private String getRedirectUrlByRole(String role) {
        return switch (role) {
            case "ADMINISTRATEUR" -> "/dashboard/admin";
            case "ENCADRANT" -> "/dashboard/encadrant";
            default -> "/dashboard/stagiaire";
        };
    }

    /**
     * Build LoginResponse object
     * @param token JWT token
     * @param role User role
     * @param user User entity
     * @return LoginResponse
     */
    private LoginResponse buildLoginResponse(String token, String role, Utilisateur user) {
        String redirectUrl = getRedirectUrlByRole(role);

        return LoginResponse.builder()
                .token(token)
                .role(role)
                .userId(user.getId())
                .email(user.getEmail())
                .redirectUrl(redirectUrl)
                .build();
    }
}