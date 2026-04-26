package com.trackify.project.repository;

import com.trackify.project.entity.IssueComment;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface IssueCommentRepository extends JpaRepository<IssueComment, Long> {
  List<IssueComment> findAllByIssueIdOrderByCreatedAtDesc(Long issueId);
}
