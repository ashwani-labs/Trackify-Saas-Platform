package com.trackify.project.service;

import com.trackify.common.exception.AppException;
import com.trackify.project.dto.ProjectRequest;
import com.trackify.project.dto.ProjectResponse;
import com.trackify.project.dto.ProjectStatsResponse;
import com.trackify.project.entity.Project;
import com.trackify.project.enums.IssueStatus;
import com.trackify.project.repository.IssueRepository;
import com.trackify.project.repository.ProjectRepository;
import com.trackify.project.util.ProjectKeyUtil;
import java.util.List;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
public class ProjectService {

  private final ProjectRepository projectRepository;
  private final IssueRepository issueRepository;

  public ProjectService(ProjectRepository projectRepository, IssueRepository issueRepository) {
    this.projectRepository = projectRepository;
    this.issueRepository = issueRepository;
  }

  @Transactional
  public ProjectResponse createProject(ProjectRequest request, Long ownerId) {
    log.info("Creating project: {} for owner: {}", request.getName(), ownerId);

    Project project =
        Project.builder()
            .name(request.getName())
            .description(request.getDescription())
            .ownerId(ownerId)
            .projectKey(resolveUniqueProjectKey(request.getName()))
            .issueCounter(0L)
            .build();

    project = projectRepository.save(project);
    return mapToResponse(project);
  }

  public ProjectStatsResponse getProjectStats(Long userId, String role) {
    long totalProjects, todoCount, inProgressCount, doneCount, totalIssues;

    if ("ADMIN".equalsIgnoreCase(role) || "MASTER".equalsIgnoreCase(role)) {
      totalProjects = projectRepository.count();
      todoCount = issueRepository.countByStatus(IssueStatus.TODO);
      inProgressCount = issueRepository.countByStatus(IssueStatus.IN_PROGRESS);
      doneCount = issueRepository.countByStatus(IssueStatus.DONE);
      totalIssues = todoCount + inProgressCount + doneCount;
    } else {
      List<Long> projectIds = projectRepository.findProjectIdsByUserId(userId);
      if (projectIds.isEmpty()) {
        return ProjectStatsResponse.builder()
            .totalProjects(0)
            .todoCount(0)
            .inProgressCount(0)
            .doneCount(0)
            .totalIssues(0)
            .build();
      }
      totalProjects = projectIds.size();
      todoCount = issueRepository.countByStatusAndProjectIdIn(IssueStatus.TODO, projectIds);
      inProgressCount =
          issueRepository.countByStatusAndProjectIdIn(IssueStatus.IN_PROGRESS, projectIds);
      doneCount = issueRepository.countByStatusAndProjectIdIn(IssueStatus.DONE, projectIds);
      totalIssues = issueRepository.countByProjectIdIn(projectIds);
    }

    return ProjectStatsResponse.builder()
        .totalProjects(totalProjects)
        .todoCount(todoCount)
        .inProgressCount(inProgressCount)
        .doneCount(doneCount)
        .totalIssues(totalIssues)
        .build();
  }

  public Page<ProjectResponse> getAllProjects(Pageable pageable, Long userId, String role) {
    log.info("Fetching projects for user: {} with role: {}", userId, role);
    if ("ADMIN".equalsIgnoreCase(role) || "MASTER".equalsIgnoreCase(role)) {
      return projectRepository.findAll(pageable).map(this::mapToResponse);
    }
    return projectRepository.findByMemberUserId(userId, pageable).map(this::mapToResponse);
  }

  public ProjectResponse getProjectById(Long id, Long userId, String role) {
    Project project =
        projectRepository
            .findById(id)
            .orElseThrow(() -> AppException.notFound("Project not found"));

    if (!"ADMIN".equalsIgnoreCase(role) && !"MASTER".equalsIgnoreCase(role)) {
      List<Long> memberProjectIds = projectRepository.findProjectIdsByUserId(userId);
      if (!memberProjectIds.contains(id)) {
        throw AppException.forbidden("You do not have access to this project");
      }
    }

    return mapToResponse(project);
  }

  @Transactional
  public ProjectResponse updateProject(Long id, ProjectRequest request) {
    Project project =
        projectRepository
            .findById(id)
            .orElseThrow(() -> AppException.notFound("Project not found"));

    project.setName(request.getName());
    project.setDescription(request.getDescription());

    project = projectRepository.save(project);
    return mapToResponse(project);
  }

  @Transactional
  public void deleteProject(Long id) {
    if (!projectRepository.existsById(id)) {
      throw AppException.notFound("Project not found");
    }
    projectRepository.deleteById(id);
  }

  private String resolveUniqueProjectKey(String name) {
    String base = ProjectKeyUtil.deriveBaseKey(name);
    String candidate = base;
    int suffix = 1;
    while (projectRepository.existsByProjectKey(candidate)) {
      candidate = base + suffix++;
    }
    return candidate;
  }

  private ProjectResponse mapToResponse(Project project) {
    return ProjectResponse.builder()
        .id(project.getId())
        .key(project.getProjectKey())
        .name(project.getName())
        .description(project.getDescription())
        .ownerId(project.getOwnerId())
        .createdAt(project.getCreatedAt())
        .updatedAt(project.getUpdatedAt())
        .build();
  }
}
