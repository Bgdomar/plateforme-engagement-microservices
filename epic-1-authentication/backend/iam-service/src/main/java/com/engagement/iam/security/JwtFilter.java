package com.engagement.iam.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
@RequiredArgsConstructor
public class JwtFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain)
            throws ServletException, IOException {

        String header = request.getHeader("Authorization");

        // 🔍 LOG DE DIAGNOSTIC
        System.out.println("🔍 === JWT FILTER ===");
        System.out.println("🔍 Path: " + request.getRequestURI());
        System.out.println("🔍 Authorization header: " + (header != null ? header.substring(0, Math.min(header.length(), 30)) + "..." : "NULL"));

        if (header != null && header.startsWith("Bearer ")) {
            String token = header.substring(7);
            System.out.println("🔍 Token présent, validation: " + jwtUtil.isTokenValid(token));

            if (jwtUtil.isTokenValid(token)) {
                String email = jwtUtil.extractEmail(token);
                String role  = jwtUtil.extractRole(token);
                System.out.println("🔍 Email: " + email + ", Rôle extrait: " + role);

                var auth = new UsernamePasswordAuthenticationToken(
                        email,
                        null,
                        List.of(new SimpleGrantedAuthority("ROLE_" + role))
                );
                SecurityContextHolder.getContext().setAuthentication(auth);
                System.out.println("🔍 Authentication set avec rôle: ROLE_" + role);
            }
        } else {
            System.out.println("🔍 PAS DE TOKEN !");
        }

        chain.doFilter(request, response);
    }
}