package com.engagement.iam_service.repository;

import com.engagement.iam_service.model.Role;
import com.engagement.iam_service.model.User;
import com.engagement.iam_service.model.UserStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    List<User> findByStatus(UserStatus status);
    List<User> findByRole(Role role);
    List<User> findByStatusNot(UserStatus status);

    @Query("SELECT u FROM User u WHERE u.status <> 'DELETED' " +
           "AND (:search IS NULL OR LOWER(u.email) LIKE LOWER(CONCAT('%',:search,'%')) " +
           "OR LOWER(u.firstName) LIKE LOWER(CONCAT('%',:search,'%')) " +
           "OR LOWER(u.lastName) LIKE LOWER(CONCAT('%',:search,'%'))) " +
           "AND (:role IS NULL OR u.role = :role) " +
           "AND (:status IS NULL OR u.status = :status)")
    Page<User> searchUsers(
            @Param("search") String search,
            @Param("role") Role role,
            @Param("status") UserStatus status,
            Pageable pageable
    );
}
