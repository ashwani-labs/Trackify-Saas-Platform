package com.trackify.project.repository;

import com.trackify.project.entity.ActivityEvent;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ActivityEventRepository extends JpaRepository<ActivityEvent, Long> {

  List<ActivityEvent> findAllByIssueIdOrderByCreatedAtDesc(Long issueId);

  Optional<ActivityEvent> findFirstByProjectIdOrderByCreatedAtDesc(Long projectId);

  Page<ActivityEvent> findAllByOrderByCreatedAtDesc(Pageable pageable);

  Page<ActivityEvent> findByProjectIdInOrderByCreatedAtDesc(
      List<Long> projectIds, Pageable pageable);
}
