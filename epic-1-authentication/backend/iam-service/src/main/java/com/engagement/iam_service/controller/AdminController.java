package com.engagement.iam_service.controller;

import com.engagement.iam_service.dto.AdminResetPasswordRequest;
import com.engagement.iam_service.dto.AdminUpdateRoleRequest;
import com.engagement.iam_service.dto.AdminUpdateStatusRequest;
import com.engagement.iam_service.dto.AdminUserRequest;
import com.engagement.iam_service.dto.AdminUserResponse;
import com.engagement.iam_service.model.Role;
import com.engagement.iam_service.model.UserStatus;
import com.engagement.iam_service.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/admin/users")
@RequiredArgsConstructor
@Slf4j
public class AdminController {

    private final UserService userService;

    // ==================== CRUD ====================

    @PostMapping
    public ResponseEntity<AdminUserResponse> createUser(
            @Valid @RequestBody AdminUserRequest request,
            Authentication authentication
    ) {
        String admin = authentication.getName();
        log.info("Admin [{}] creating user: {}", admin, request.getEmail());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(userService.adminCreateUser(request, admin));
    }

    @GetMapping
    public ResponseEntity<Page<AdminUserResponse>> getUsers(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Role role,
            @RequestParam(required = false) UserStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir
    ) {
        return ResponseEntity.ok(
                userService.adminSearchUsers(search, role, status, page, size, sortBy, sortDir)
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<AdminUserResponse> getUserById(@PathVariable("id") Long id) {
        return ResponseEntity.ok(userService.adminGetUserById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AdminUserResponse> updateUser(
            @PathVariable("id") Long id,
            @Valid @RequestBody AdminUserRequest request,
            Authentication authentication
    ) {
        String admin = authentication.getName();
        log.info("Admin [{}] updating user id={}", admin, id);
        return ResponseEntity.ok(userService.adminUpdateUser(id, request, admin));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> softDeleteUser(
            @PathVariable("id") Long id,
            Authentication authentication
    ) {
        String admin = authentication.getName();
        log.info("Admin [{}] soft-deleting user id={}", admin, id);
        userService.adminSoftDeleteUser(id, admin);
        return ResponseEntity.ok(Map.of("message", "User deleted successfully."));
    }

    // ==================== STATUS ACTIONS ====================

    @PutMapping("/{id}/block")
    public ResponseEntity<AdminUserResponse> blockUser(
            @PathVariable("id") Long id,
            Authentication authentication
    ) {
        String admin = authentication.getName();
        log.info("Admin [{}] blocking user id={}", admin, id);
        return ResponseEntity.ok(userService.adminBlockUser(id, admin));
    }

    @PutMapping("/{id}/activate")
    public ResponseEntity<AdminUserResponse> activateUser(
            @PathVariable("id") Long id,
            Authentication authentication
    ) {
        String admin = authentication.getName();
        log.info("Admin [{}] activating user id={}", admin, id);
        return ResponseEntity.ok(userService.adminActivateUser(id, admin));
    }

    // ==================== LEGACY ENDPOINTS (backward compat) ====================

    @GetMapping("/pending")
    public ResponseEntity<List<AdminUserResponse>> getPendingUsers() {
        return ResponseEntity.ok(
                userService.getPendingUsers().stream()
                        .map(UserService::toAdminResponse).toList()
        );
    }

    @GetMapping("/all")
    public ResponseEntity<List<AdminUserResponse>> getAllUsers() {
        return ResponseEntity.ok(
                userService.getAllUsers().stream()
                        .map(UserService::toAdminResponse).toList()
        );
    }

    @PostMapping("/{id}/approve")
    public ResponseEntity<Map<String, String>> approveUser(@PathVariable("id") Long id) {
        userService.approveUser(id);
        return ResponseEntity.ok(Map.of("message", "User approved successfully."));
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<Map<String, String>> rejectUser(@PathVariable("id") Long id) {
        userService.rejectUser(id);
        return ResponseEntity.ok(Map.of("message", "User rejected successfully."));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Map<String, String>> updateUserStatus(
            @PathVariable("id") Long id,
            @RequestBody AdminUpdateStatusRequest request
    ) {
        userService.updateUserStatus(id, request.getStatus());
        return ResponseEntity.ok(Map.of("message", "User status updated successfully."));
    }

    @PatchMapping("/{id}/role")
    public ResponseEntity<Map<String, String>> updateUserRole(
            @PathVariable("id") Long id,
            @RequestBody AdminUpdateRoleRequest request
    ) {
        userService.updateUserRole(id, request.getRole());
        return ResponseEntity.ok(Map.of("message", "User role updated successfully."));
    }

    @PostMapping("/{id}/reset-password")
    public ResponseEntity<Map<String, String>> resetUserPassword(
            @PathVariable("id") Long id,
            @RequestBody AdminResetPasswordRequest request
    ) {
        userService.resetUserPassword(id, request.getNewPassword());
        return ResponseEntity.ok(Map.of("message", "User password reset successfully."));
    }
}
