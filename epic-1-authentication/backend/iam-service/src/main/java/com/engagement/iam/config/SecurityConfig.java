package com.engagement.iam.config;

import com.engagement.iam.security.JwtFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtFilter jwtFilter;

    @Bean
    public BCryptPasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .sessionManagement(s -> s.sessionCreationPolicy(
                        SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // FIX #4 : regroupement propre des routes publiques
                        // /api/auth/** couvre déjà /login et /facial-login — pas besoin de les répéter
                        .requestMatchers(
                                "/inscriptions/**",
                                "/api/inscriptions/**",
                                "/auth/**",
                                "/api/auth/**",
                                "/assets/**",
                                "/actuator/**",
                                "/uploads/**"
                        ).permitAll()
                        // Routes par rôle /api/admin/inscriptions
                        .requestMatchers("/api/admin/inscriptions/**").hasRole("ADMINISTRATEUR")
                        .requestMatchers("/api/admin/**").hasRole("ADMINISTRATEUR")  // ← Changement clé
                        .requestMatchers("/api/stagiaire/**").hasRole("STAGIAIRE")
                        .requestMatchers("/api/encadrant/**").hasRole("ENCADRANT")
                        .requestMatchers("/api/profil/**").hasAnyRole("STAGIAIRE", "ENCADRANT", "ADMINISTRATEUR")
                        // FIX #4 : lignes dupliquées supprimées (elles étaient après anyRequest et ignorées)
                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtFilter,
                        UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}