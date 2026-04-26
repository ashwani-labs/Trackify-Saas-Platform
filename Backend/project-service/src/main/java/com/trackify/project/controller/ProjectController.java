package com.trackify.project.controller;

import com.trackify.common.dto.ApiResponse;
import com.trackify.common.security.JwtUtil;
import com.trackify.project.dto.ProjectRequest;
import com.trackify.project.dto.ProjectResponse;
import com.trackify.project.dto.ProjectStatsResponse;
import com.trackify.project.service.ProjectService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

@RestController
@RequestMapping("/projects")
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectService projectService;
    private final JwtUtil jwtUtil;

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<ProjectStatsResponse>> getProjectStats(
            @RequestHeader("Authorization") String authHeader) {
        String token = authHeader.substring(7);
        Long userId = jwtUtil.extractUserId(token);
        String role = jwtUtil.extractRole(token);
        return ResponseEntity.ok(ApiResponse.ok("Stats fetched successfully", projectService.getProjectStats(userId, role)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ProjectResponse>> createProject(
            @RequestHeader("Authorization") String authHeader,
            @Valid @RequestBody ProjectRequest request) {
        
        Long userId = jwtUtil.extractUserId(authHeader.substring(7));
        ProjectResponse response = projectService.createProject(request, userId);
        return ResponseEntity.ok(ApiResponse.ok("Project created successfully", response));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<ProjectResponse>>> getAllProjects(
            @RequestHeader("Authorization") String authHeader,
            Pageable pageable) {
        String token = authHeader.substring(7);
        Long userId = jwtUtil.extractUserId(token);
        String role = jwtUtil.extractRole(token);
        
        Page<ProjectResponse> response = projectService.getAllProjects(pageable, userId, role);
        return ResponseEntity.ok(ApiResponse.ok("Projects fetched successfully", response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProjectResponse>> getProjectById(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable("id") Long id) {
        String token = authHeader.substring(7);
        Long userId = jwtUtil.extractUserId(token);
        String role = jwtUtil.extractRole(token);
        ProjectResponse response = projectService.getProjectById(id, userId, role);
        return ResponseEntity.ok(ApiResponse.ok("Project fetched successfully", response));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ProjectResponse>> updateProject(
            @PathVariable("id") Long id,
            @Valid @RequestBody ProjectRequest request) {
        ProjectResponse response = projectService.updateProject(id, request);
        return ResponseEntity.ok(ApiResponse.ok("Project updated successfully", response));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteProject(@PathVariable("id") Long id) {
        projectService.deleteProject(id);
        return ResponseEntity.ok(ApiResponse.ok("Project deleted successfully", null));
    }
}
