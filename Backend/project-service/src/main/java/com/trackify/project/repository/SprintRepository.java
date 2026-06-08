package com.trackify.project.repository;

import com.trackify.project.entity.Sprint;
import com.trackify.project.enums.SprintStatus;
import java.util.Collection;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface SprintRepository extends JpaRepository<Sprint, Long> {
  List<Sprint> findByProjectId(Long projectId);

  List<Sprint> findByProjectIdAndStatus(Long projectId, SprintStatus status);

  long countByStatus(SprintStatus status);

  @Query("SELECT COUNT(s) FROM Sprint s WHERE s.status = :status AND s.project.id IN :projectIds")
  long countByStatusAndProjectIds(
      @Param("status") SprintStatus status, @Param("projectIds") Collection<Long> projectIds);
}
