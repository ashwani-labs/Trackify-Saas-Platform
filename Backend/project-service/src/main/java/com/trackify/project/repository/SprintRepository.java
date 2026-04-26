package com.trackify.project.repository;

import com.trackify.project.entity.Sprint;
import com.trackify.project.enums.SprintStatus;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SprintRepository extends JpaRepository<Sprint, Long> {
  List<Sprint> findByProjectId(Long projectId);

  List<Sprint> findByProjectIdAndStatus(Long projectId, SprintStatus status);
}
