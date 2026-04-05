package com.trackify.project.service;

import com.trackify.common.exception.AppException;
import com.trackify.project.dto.ProjectRequest;
import com.trackify.project.dto.ProjectResponse;
import com.trackify.project.entity.Project;
import com.trackify.project.repository.ProjectRepository;
import java.util.List;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ProjectService {

    private static final Logger log = LoggerFactory.getLogger(ProjectService.class);
    private final ProjectRepository projectRepository;

    public ProjectService(ProjectRepository projectRepository) {
        this.projectRepository = projectRepository;
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

    public List<ProjectResponse> getAllProjects() {
        return projectRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
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
