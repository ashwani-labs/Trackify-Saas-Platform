package com.trackify.project.controller;

import com.trackify.common.dto.ApiResponse;
import com.trackify.project.dto.SprintRequest;
import com.trackify.project.dto.SprintResponse;
import com.trackify.project.service.SprintService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/projects/{projectId}/sprints")
@RequiredArgsConstructor
public class SprintController {

    private final SprintService sprintService;

    @PostMapping
    public ResponseEntity<ApiResponse<SprintResponse>> createSprint(
            @PathVariable Long projectId,
            @Valid @RequestBody SprintRequest request) {
        // override projectId from path if needed
        request.setProjectId(projectId);
        SprintResponse response = sprintService.createSprint(request);
        return ResponseEntity.ok(ApiResponse.ok("Sprint created", response));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<SprintResponse>>> getSprintsByProject(@PathVariable Long projectId) {
        return ResponseEntity.ok(ApiResponse.ok("Sprints fetched", sprintService.getSprintsByProject(projectId)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<SprintResponse>> updateSprint(
            @PathVariable Long projectId,
            @PathVariable Long id,
            @Valid @RequestBody SprintRequest request) {
        request.setProjectId(projectId);
        SprintResponse response = sprintService.updateSprint(id, request);
        return ResponseEntity.ok(ApiResponse.ok("Sprint updated", response));
    }

    @PutMapping("/{id}/start")
    public ResponseEntity<ApiResponse<SprintResponse>> startSprint(
            @PathVariable Long projectId,
            @PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok("Sprint started", sprintService.startSprint(id)));
    }

    @PutMapping("/{id}/complete")
    public ResponseEntity<ApiResponse<SprintResponse>> completeSprint(
            @PathVariable Long projectId,
            @PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok("Sprint completed", sprintService.completeSprint(id)));
    }
}
