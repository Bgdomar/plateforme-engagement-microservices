package com.engagement.iam_service.service;

import com.engagement.iam_service.dto.AdminUserRequest;
import com.engagement.iam_service.dto.AdminUserResponse;
import com.engagement.iam_service.model.User;
import com.engagement.iam_service.model.Role;
import com.engagement.iam_service.model.UserStatus;
import com.engagement.iam_service.repository.UserRepository;
import com.engagement.iam_service.security.JwtService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final StorageService storageService;
    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${appAi.baseUrl}")
    private String aiBaseUrl;

    public List<User> getPendingUsers() {
        return userRepository.findByStatus(UserStatus.PENDING);
    }

    public void approveUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setStatus(UserStatus.APPROVED);
        userRepository.save(user);
    }

    public void rejectUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setStatus(UserStatus.REJECTED);
        userRepository.save(user);
    }

    public void updateUserStatus(Long id, UserStatus status) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setStatus(status);
        userRepository.save(user);
    }

    public void updateUserRole(Long id, Role role) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setRole(role);
        userRepository.save(user);
    }

    public void updateUserEmail(Long id, String newEmail) {
        if (newEmail == null || newEmail.isBlank()) {
            throw new RuntimeException("Email is required");
        }

        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String currentEmail = user.getEmail();
        if (currentEmail != null && currentEmail.equalsIgnoreCase(newEmail)) {
            return;
        }

        if (userRepository.existsByEmail(newEmail)) {
            throw new RuntimeException("Email already exists");
        }

        user.setEmail(newEmail);
        userRepository.save(user);
    }

    public void resetUserPassword(Long id, String newPassword) {
        if (newPassword == null || newPassword.isBlank()) {
            throw new RuntimeException("Password is required");
        }

        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public com.engagement.iam_service.dto.ProfileImageUploadResponse uploadProfileImage(
            String authenticatedEmail,
            MultipartFile file
    ) {
        User user = getUserByEmail(authenticatedEmail);
        String url = storageService.uploadProfileImage(user.getId(), file);
        user.setProfileImageUrl(url);
        userRepository.save(user);
        return com.engagement.iam_service.dto.ProfileImageUploadResponse.builder()
                .imageUrl(url)
                .build();
    }

    public com.engagement.iam_service.dto.ProfileResponse getProfile(String authenticatedEmail) {
        User user = getUserByEmail(authenticatedEmail);
        return toProfileResponse(user, null);
    }

    public User markFaceRegistered(String authenticatedEmail) {
        User user = getUserByEmail(authenticatedEmail);
        if (!user.isFaceRegistered()) {
            user.setFaceRegistered(true);
            userRepository.save(user);
        }
        return user;
    }

    public com.engagement.iam_service.dto.ProfileResponse updateProfile(
            String authenticatedEmail,
            com.engagement.iam_service.dto.ProfileUpdateRequest request
    ) {
        User user = getUserByEmail(authenticatedEmail);

        boolean emailChanged = request.getEmail() != null
                && !request.getEmail().isBlank()
                && !request.getEmail().equalsIgnoreCase(user.getEmail());

        if (emailChanged) {
            if (userRepository.existsByEmail(request.getEmail())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email already exists");
            }
            user.setEmail(request.getEmail());
        }

        if (request.getFirstName() != null) {
            user.setFirstName(request.getFirstName().isBlank() ? null : request.getFirstName());
        }
        if (request.getLastName() != null) {
            user.setLastName(request.getLastName().isBlank() ? null : request.getLastName());
        }
        if (request.getPhone() != null) {
            user.setPhone(request.getPhone().isBlank() ? null : request.getPhone());
        }
        if (request.getPosition() != null) {
            user.setPosition(request.getPosition().isBlank() ? null : request.getPosition());
        }
        if (request.getDepartment() != null) {
            user.setDepartment(request.getDepartment().isBlank() ? null : request.getDepartment());
        }
        if (request.getAddress() != null) {
            user.setAddress(request.getAddress().isBlank() ? null : request.getAddress());
        }

        User saved = userRepository.save(user);

        String newToken = null;
        if (emailChanged) {
            newToken = jwtService.generateToken(saved);
        }

        return toProfileResponse(saved, newToken);
    }

    private static com.engagement.iam_service.dto.ProfileResponse toProfileResponse(User u, String token) {
        return com.engagement.iam_service.dto.ProfileResponse.builder()
                .id(u.getId())
                .email(u.getEmail())
                .firstName(u.getFirstName())
                .lastName(u.getLastName())
                .role(u.getRole())
                .status(u.getStatus())
                .phone(u.getPhone())
                .profileImageUrl(u.getProfileImageUrl())
                .position(u.getPosition())
                .department(u.getDepartment())
                .dateOfBirth(u.getBirthDate())
                .address(u.getAddress())
                .active(u.isActive())
                .createdAt(u.getCreatedAt())
                .updatedAt(u.getUpdatedAt())
                .token(token)
                .build();
    }
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public void deleteUser(Long id) {
        Objects.requireNonNull(id);
        userRepository.findById(id).ifPresent(user -> {
            try {
                log.info("Deleting face model for user: {}", user.getEmail());
                restTemplate.delete(aiBaseUrl + "/api/v1/faces?user_email=" + user.getEmail());
            } catch (Exception e) {
                log.warn("Failed to delete face model for {}: {}", user.getEmail(), e.getMessage());
            }
        });
        userRepository.deleteById(id);
    }

    // ==================== ADMIN USER MANAGEMENT ====================

    public AdminUserResponse adminCreateUser(AdminUserRequest request, String createdBy) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email already exists");
        }
        if (request.getPassword() == null || request.getPassword().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Password is required for new users");
        }

        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .phone(request.getPhone())
                .position(request.getPosition())
                .department(request.getDepartment())
                .address(request.getAddress())
                .role(request.getRole() != null ? request.getRole() : Role.USER)
                .status(request.getStatus() != null ? request.getStatus() : UserStatus.ACTIVE)
                .active(true)
                .createdBy(createdBy)
                .updatedBy(createdBy)
                .build();

        return toAdminResponse(userRepository.save(user));
    }

    public AdminUserResponse adminUpdateUser(Long id, AdminUserRequest request, String updatedBy) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        if (user.getStatus() == UserStatus.DELETED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot update a deleted user");
        }

        if (request.getEmail() != null && !request.getEmail().isBlank()
                && !request.getEmail().equalsIgnoreCase(user.getEmail())) {
            if (userRepository.existsByEmail(request.getEmail())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email already exists");
            }
            user.setEmail(request.getEmail());
        }

        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            user.setPassword(passwordEncoder.encode(request.getPassword()));
        }
        if (request.getFirstName() != null) user.setFirstName(request.getFirstName());
        if (request.getLastName() != null) user.setLastName(request.getLastName());
        if (request.getPhone() != null) user.setPhone(request.getPhone());
        if (request.getPosition() != null) user.setPosition(request.getPosition());
        if (request.getDepartment() != null) user.setDepartment(request.getDepartment());
        if (request.getAddress() != null) user.setAddress(request.getAddress());
        if (request.getRole() != null) user.setRole(request.getRole());
        if (request.getStatus() != null) user.setStatus(request.getStatus());

        user.setUpdatedBy(updatedBy);
        return toAdminResponse(userRepository.save(user));
    }

    public void adminSoftDeleteUser(Long id, String deletedBy) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        user.setStatus(UserStatus.DELETED);
        user.setActive(false);
        user.setUpdatedBy(deletedBy);
        userRepository.save(user);

        try {
            log.info("Deleting face model for soft-deleted user: {}", user.getEmail());
            restTemplate.delete(aiBaseUrl + "/api/v1/faces?user_email=" + user.getEmail());
        } catch (Exception e) {
            log.warn("Failed to delete face model for {}: {}", user.getEmail(), e.getMessage());
        }
    }

    public AdminUserResponse adminBlockUser(Long id, String updatedBy) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        user.setStatus(UserStatus.BLOCKED);
        user.setActive(false);
        user.setUpdatedBy(updatedBy);
        return toAdminResponse(userRepository.save(user));
    }

    public AdminUserResponse adminActivateUser(Long id, String updatedBy) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        user.setStatus(UserStatus.ACTIVE);
        user.setActive(true);
        user.setUpdatedBy(updatedBy);
        return toAdminResponse(userRepository.save(user));
    }

    public AdminUserResponse adminGetUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        return toAdminResponse(user);
    }

    public Page<AdminUserResponse> adminSearchUsers(String search, Role role, UserStatus status,
                                                     int page, int size, String sortBy, String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase("desc")
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        return userRepository.searchUsers(search, role, status, pageable)
                .map(UserService::toAdminResponse);
    }

    public static AdminUserResponse toAdminResponse(User u) {
        return AdminUserResponse.builder()
                .id(u.getId())
                .email(u.getEmail())
                .firstName(u.getFirstName())
                .lastName(u.getLastName())
                .phone(u.getPhone())
                .position(u.getPosition())
                .department(u.getDepartment())
                .address(u.getAddress())
                .profileImageUrl(u.getProfileImageUrl())
                .role(u.getRole())
                .status(u.getStatus())
                .active(u.isActive())
                .faceRegistered(u.isFaceRegistered())
                .createdBy(u.getCreatedBy())
                .updatedBy(u.getUpdatedBy())
                .createdAt(u.getCreatedAt())
                .updatedAt(u.getUpdatedAt())
                .build();
    }
}
