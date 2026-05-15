package com.engagement.tm.repository;

import com.engagement.tm.entity.Mission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MissionRepository extends JpaRepository<Mission, Long> {
    List<Mission> findByEquipeId(Long equipeId);
    List<Mission> findByEquipeIdAndCreeParId(Long equipeId, Long creeParId);
}