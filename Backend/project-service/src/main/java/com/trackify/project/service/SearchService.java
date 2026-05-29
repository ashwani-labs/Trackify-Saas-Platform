package com.trackify.project.service;

import com.trackify.project.dto.GlobalSearchResponse;
import com.trackify.project.dto.IssueResponse;
import com.trackify.project.dto.ProjectResponse;
import com.trackify.project.dto.SearchUserResult;
import com.trackify.project.entity.Issue;
import com.trackify.project.entity.Project;
import com.trackify.project.repository.IssueRepository;
import com.trackify.project.repository.ProjectRepository;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class SearchService {

  private static final int MAX_LIMIT = 20;

  private final ProjectRepository projectRepository;
  private final IssueRepository issueRepository;
  private final JdbcTemplate jdbcTemplate;

  @Transactional(readOnly = true)
  public GlobalSearchResponse search(String query, int limit, Long userId, String role) {
    String term = query == null ? "" : query.trim();
    if (term.isEmpty()) {
      return GlobalSearchResponse.builder()
          .projects(List.of())
          .issues(List.of())
          .users(List.of())
          .build();
    }

    int effectiveLimit = Math.min(Math.max(limit, 1), MAX_LIMIT);
    Pageable pageable = PageRequest.of(0, effectiveLimit);
    boolean elevated = isElevatedRole(role);

    List<ProjectResponse> projects = searchProjects(term, userId, elevated, pageable);
    List<IssueResponse> issues = searchIssues(term, userId, elevated, pageable);
    List<SearchUserResult> users = searchUsers(term, elevated, effectiveLimit);

    return GlobalSearchResponse.builder().projects(projects).issues(issues).users(users).build();
  }

  private List<ProjectResponse> searchProjects(
      String term, Long userId, boolean elevated, Pageable pageable) {
    List<Project> matches;
    if (elevated) {
      matches = projectRepository.searchAllByTerm(term, pageable);
    } else {
      List<Long> projectIds = projectRepository.findProjectIdsByUserId(userId);
      if (projectIds.isEmpty()) {
        return List.of();
      }
      matches = projectRepository.searchByTermAndProjectIds(projectIds, term, pageable);
    }
    return matches.stream().map(this::mapProject).collect(Collectors.toList());
  }

  private List<IssueResponse> searchIssues(
      String term, Long userId, boolean elevated, Pageable pageable) {
    Map<Long, Issue> merged = new LinkedHashMap<>();

    List<Issue> primary =
        elevated
            ? issueRepository.searchAllByTerm(term, pageable)
            : searchIssuesForMember(term, userId, pageable);
    primary.forEach(issue -> merged.put(issue.getId(), issue));

    List<Long> assigneeMatchIds = findIssueIdsByAssignee(term, userId, elevated, pageable.getPageSize());
    if (!assigneeMatchIds.isEmpty()) {
      issueRepository.findAllById(assigneeMatchIds).forEach(issue -> merged.put(issue.getId(), issue));
    }

    return merged.values().stream()
        .limit(pageable.getPageSize())
        .map(this::mapIssue)
        .collect(Collectors.toList());
  }

  private List<Issue> searchIssuesForMember(String term, Long userId, Pageable pageable) {
    List<Long> projectIds = projectRepository.findProjectIdsByUserId(userId);
    if (projectIds.isEmpty()) {
      return List.of();
    }
    return issueRepository.searchByTermAndProjectIds(projectIds, term, pageable);
  }

  private List<Long> findIssueIdsByAssignee(
      String term, Long userId, boolean elevated, int limit) {
    String pattern = "%" + term.toLowerCase() + "%";
    if (elevated) {
      return jdbcTemplate.query(
          """
          SELECT DISTINCT i.id FROM issues i
          INNER JOIN users u ON u.id = i.assignee_id
          WHERE LOWER(u.email) LIKE ? OR LOWER(COALESCE(u.full_name, '')) LIKE ?
          LIMIT ?
          """,
          (rs, rowNum) -> rs.getLong("id"),
          pattern,
          pattern,
          limit);
    }

    List<Long> projectIds = projectRepository.findProjectIdsByUserId(userId);
    if (projectIds.isEmpty()) {
      return List.of();
    }

    String placeholders = projectIds.stream().map(id -> "?").collect(Collectors.joining(","));
    List<Object> params = new ArrayList<>();
    params.add(pattern);
    params.add(pattern);
    params.addAll(projectIds);
    params.add(limit);

    return jdbcTemplate.query(
        """
        SELECT DISTINCT i.id FROM issues i
        INNER JOIN users u ON u.id = i.assignee_id
        WHERE (LOWER(u.email) LIKE ? OR LOWER(COALESCE(u.full_name, '')) LIKE ?)
        AND i.project_id IN (%s)
        LIMIT ?
        """
            .formatted(placeholders),
        (rs, rowNum) -> rs.getLong("id"),
        params.toArray());
  }

  private List<SearchUserResult> searchUsers(String term, boolean elevated, int limit) {
    String pattern = "%" + term.toLowerCase() + "%";
    String sql =
        elevated
            ? """
            SELECT id, email, full_name FROM users
            WHERE LOWER(email) LIKE ? OR LOWER(COALESCE(full_name, '')) LIKE ?
            ORDER BY email
            LIMIT ?
            """
            : """
            SELECT id, email, full_name FROM users
            WHERE status = 'ACTIVE'
            AND (LOWER(email) LIKE ? OR LOWER(COALESCE(full_name, '')) LIKE ?)
            ORDER BY email
            LIMIT ?
            """;

    return jdbcTemplate.query(
        sql,
        (rs, rowNum) ->
            SearchUserResult.builder()
                .id(rs.getLong("id"))
                .email(rs.getString("email"))
                .fullName(rs.getString("full_name"))
                .build(),
        pattern,
        pattern,
        limit);
  }

  private boolean isElevatedRole(String role) {
    return "ADMIN".equalsIgnoreCase(role) || "MASTER".equalsIgnoreCase(role);
  }

  private ProjectResponse mapProject(Project project) {
    return ProjectResponse.builder()
        .id(project.getId())
        .name(project.getName())
        .description(project.getDescription())
        .ownerId(project.getOwnerId())
        .createdAt(project.getCreatedAt())
        .updatedAt(project.getUpdatedAt())
        .build();
  }

  private IssueResponse mapIssue(Issue issue) {
    return IssueResponse.builder()
        .id(issue.getId())
        .title(issue.getTitle())
        .description(issue.getDescription())
        .status(issue.getStatus())
        .priority(issue.getPriority())
        .projectId(issue.getProject().getId())
        .projectHeaderName(issue.getProject().getName())
        .reporterId(issue.getReporterId())
        .assigneeId(issue.getAssigneeId())
        .sprintId(issue.getSprint() != null ? issue.getSprint().getId() : null)
        .createdAt(issue.getCreatedAt())
        .updatedAt(issue.getUpdatedAt())
        .build();
  }
}
