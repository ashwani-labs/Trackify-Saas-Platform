package com.trackify.project.service;

import com.trackify.common.exception.AppException;
import com.trackify.project.dto.ProjectRequest;
import com.trackify.project.dto.ProjectResponse;
import com.trackify.project.dto.ProjectStatsResponse;
import com.trackify.project.entity.Project;
import com.trackify.project.enums.IssueStatus;
import com.trackify.project.repository.IssueRepository;
import com.trackify.project.repository.ProjectRepository;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import lombok.extern.slf4j.Slf4j;

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
        
        Project project = Project.builder()
                .name(request.getName())
                .description(request.getDescription())
                .ownerId(ownerId)
                .build();

        project = projectRepository.save(project);
        return mapToResponse(project);
    }

    public ProjectStatsResponse getProjectStats() {
        long totalProjects = projectRepository.count();
        long todoCount = issueRepository.countByStatus(IssueStatus.TODO);
        long inProgressCount = issueRepository.countByStatus(IssueStatus.IN_PROGRESS);
        long doneCount = issueRepository.countByStatus(IssueStatus.DONE);
        long totalIssues = todoCount + inProgressCount + doneCount;

        return ProjectStatsResponse.builder()
                .totalProjects(totalProjects)
                .todoCount(todoCount)
                .inProgressCount(inProgressCount)
                .doneCount(doneCount)
                .totalIssues(totalIssues)
                .build();
    }

    public Page<ProjectResponse> getAllProjects(Pageable pageable) {
        return projectRepository.findAll(pageable).map(this::mapToResponse);
    }

    public ProjectResponse getProjectById(Long id) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> AppException.notFound("Project not found"));
        return mapToResponse(project);
    }

    @Transactional
    public ProjectResponse updateProject(Long id, ProjectRequest request) {
        Project project = projectRepository.findById(id)
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

    private ProjectResponse mapToResponse(Project project) {
        return ProjectResponse.builder()
                .id(project.getId())
                .name(project.getName())
                .description(project.getDescription())
                .ownerId(project.getOwnerId())
                .createdAt(project.getCreatedAt())
                .updatedAt(project.getUpdatedAt())
                .build();
    }
}
