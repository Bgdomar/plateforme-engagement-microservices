package com.engagement.iam_service.repository;

import com.engagement.iam_service.model.Team;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TeamRepository extends JpaRepository<Team, Long> {
    @EntityGraph(attributePaths = {"members"})
    List<Team> findByManagerId(Long managerId);
}
