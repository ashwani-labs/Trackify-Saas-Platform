package com.trackify.project.repository;

import com.trackify.project.entity.IssueComment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IssueCommentRepository extends JpaRepository<IssueComment, Long> {
    List<IssueComment> findAllByIssueIdOrderByCreatedAtDesc(Long issueId);
}
