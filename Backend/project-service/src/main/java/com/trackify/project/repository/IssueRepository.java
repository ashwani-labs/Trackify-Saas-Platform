package com.trackify.project.repository;

import com.trackify.project.entity.Issue;
import com.trackify.project.enums.IssueStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IssueRepository extends JpaRepository<Issue, Long> {
    List<Issue> findAllByProjectId(Long projectId);
    List<Issue> findAllByAssigneeId(Long assigneeId);
    List<Issue> findAllByProjectIdAndStatus(Long projectId, IssueStatus status);
}
