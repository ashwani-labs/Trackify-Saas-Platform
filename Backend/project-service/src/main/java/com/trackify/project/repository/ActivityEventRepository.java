package com.trackify.project.repository;

import com.trackify.project.entity.ActivityEvent;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ActivityEventRepository extends JpaRepository<ActivityEvent, Long> {

  List<ActivityEvent> findAllByIssueIdOrderByCreatedAtDesc(Long issueId);
}
