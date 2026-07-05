package com.trackify.project.repository;

import com.trackify.project.entity.Issue;
import com.trackify.project.enums.IssuePriority;
import com.trackify.project.enums.IssueStatus;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface IssueRepository extends JpaRepository<Issue, Long> {
  Optional<Issue> findByIssueKey(String issueKey);

  List<Issue> findAllByProjectId(Long projectId);

  Page<Issue> findAllByProjectId(Long projectId, Pageable pageable);

  List<Issue> findAllByAssigneeId(Long assigneeId);

  List<Issue> findAllByProjectIdAndStatus(Long projectId, IssueStatus status);

  List<Issue> findAllBySprintId(Long sprintId);

  long countByStatus(IssueStatus status);

  long countByProjectIdIn(List<Long> projectIds);

  long countByStatusAndProjectIdIn(IssueStatus status, List<Long> projectIds);

  long countByProjectId(Long projectId);

  long countByProjectIdAndStatus(Long projectId, IssueStatus status);

  long countByAssigneeIdAndStatusNot(Long assigneeId, IssueStatus status);

  long countByPriority(IssuePriority priority);

  @Query(
      "SELECT COUNT(i) FROM Issue i WHERE i.priority = :priority AND i.project.id IN :projectIds")
  long countByPriorityAndProjectIds(
      @Param("priority") IssuePriority priority, @Param("projectIds") List<Long> projectIds);

  @Query(
      "SELECT i FROM Issue i JOIN FETCH i.project p WHERE i.assigneeId = :userId "
          + "AND i.status <> :doneStatus ORDER BY i.updatedAt DESC")
  List<Issue> findMyOpenIssues(
      @Param("userId") Long userId, @Param("doneStatus") IssueStatus doneStatus, Pageable pageable);

  @Query(
      "SELECT DISTINCT i FROM Issue i JOIN FETCH i.project p WHERE "
          + "LOWER(i.title) LIKE LOWER(CONCAT('%', :term, '%')) "
          + "OR LOWER(COALESCE(i.issueKey, '')) LIKE LOWER(CONCAT('%', :term, '%')) "
          + "OR LOWER(CONCAT('', i.status)) LIKE LOWER(CONCAT('%', :term, '%')) "
          + "OR LOWER(p.name) LIKE LOWER(CONCAT('%', :term, '%'))")
  List<Issue> searchAllByTerm(@Param("term") String term, Pageable pageable);

  @Query(
      "SELECT DISTINCT i FROM Issue i JOIN FETCH i.project p WHERE i.project.id IN :projectIds AND ("
          + "LOWER(i.title) LIKE LOWER(CONCAT('%', :term, '%')) "
          + "OR LOWER(COALESCE(i.issueKey, '')) LIKE LOWER(CONCAT('%', :term, '%')) "
          + "OR LOWER(CONCAT('', i.status)) LIKE LOWER(CONCAT('%', :term, '%')) "
          + "OR LOWER(p.name) LIKE LOWER(CONCAT('%', :term, '%')))")
  List<Issue> searchByTermAndProjectIds(
      @Param("projectIds") List<Long> projectIds, @Param("term") String term, Pageable pageable);

  @Query(
      "SELECT DISTINCT i.labels FROM Issue i WHERE i.project.id = :projectId AND i.labels IS NOT NULL AND i.labels <> ''")
  List<String> findDistinctLabelValuesByProjectId(@Param("projectId") Long projectId);
}
