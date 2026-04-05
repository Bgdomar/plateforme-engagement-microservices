package com.engagement.iam_service.exception;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Map;

@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> handleAllExceptions(Exception ex) {
        String message = ex.getMessage();
        String exceptionType = ex.getClass().getSimpleName();
        HttpStatus status = HttpStatus.BAD_REQUEST;

        if (ex instanceof org.springframework.security.authentication.BadCredentialsException) {
            status = HttpStatus.UNAUTHORIZED;
            message = "Identifiants incorrects.";
        } else if (ex instanceof org.springframework.security.core.AuthenticationException) {
            status = HttpStatus.UNAUTHORIZED;
        } else if (message != null && message.contains("not approved")) {
            status = HttpStatus.FORBIDDEN;
        } else if (message != null && message.contains("not found")) {
            status = HttpStatus.NOT_FOUND;
        } else if (message != null && message.contains("already exists")) {
            status = HttpStatus.CONFLICT;
        }

        log.error("Exception caught: {} - {}", exceptionType, message);
        return ResponseEntity.status(status).body(Map.of(
            "message", message != null ? message : "An error occurred",
            "type", exceptionType
        ));
    }
}
