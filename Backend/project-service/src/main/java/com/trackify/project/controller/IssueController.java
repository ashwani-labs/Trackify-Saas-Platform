package com.trackify.project.controller;

import com.trackify.common.dto.ApiResponse;
import com.trackify.common.security.JwtUtil;
import com.trackify.project.dto.CommentRequest;
import com.trackify.project.dto.CommentResponse;
import com.trackify.project.dto.IssueRequest;
import com.trackify.project.dto.IssueResponse;
import com.trackify.project.service.IssueService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/issues")
@RequiredArgsConstructor
public class IssueController {

    private final IssueService issueService;
    private final JwtUtil jwtUtil;

    @PostMapping
    public ResponseEntity<ApiResponse<IssueResponse>> createIssue(
            @RequestHeader("Authorization") String authHeader,
            @Valid @RequestBody IssueRequest request) {
        
        Long userId = jwtUtil.extractUserId(authHeader.substring(7));
        IssueResponse response = issueService.createIssue(request, userId);
        return ResponseEntity.ok(ApiResponse.ok("Issue created successfully", response));
    }

    @GetMapping("/project/{projectId}")
    public ResponseEntity<ApiResponse<List<IssueResponse>>> getIssuesByProject(@PathVariable Long projectId) {
        List<IssueResponse> response = issueService.getIssuesByProject(projectId);
        return ResponseEntity.ok(ApiResponse.ok("Issues fetched successfully", response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<IssueResponse>> getIssueById(@PathVariable Long id) {
        IssueResponse response = issueService.getIssueById(id);
        return ResponseEntity.ok(ApiResponse.ok("Issue fetched successfully", response));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<IssueResponse>> updateIssue(
            @PathVariable Long id,
            @Valid @RequestBody IssueRequest request) {
        IssueResponse response = issueService.updateIssue(id, request);
        return ResponseEntity.ok(ApiResponse.ok("Issue updated successfully", response));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteIssue(@PathVariable Long id) {
        issueService.deleteIssue(id);
        return ResponseEntity.ok(ApiResponse.ok("Issue deleted successfully", null));
    }

    // --- Comments ---

    @PostMapping("/{id}/comments")
    public ResponseEntity<ApiResponse<CommentResponse>> addComment(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long id,
            @Valid @RequestBody CommentRequest request) {
        
        Long userId = jwtUtil.extractUserId(authHeader.substring(7));
        CommentResponse response = issueService.addComment(id, request, userId);
        return ResponseEntity.ok(ApiResponse.ok("Comment added successfully", response));
    }

    @GetMapping("/{id}/comments")
    public ResponseEntity<ApiResponse<List<CommentResponse>>> getIssueComments(@PathVariable Long id) {
        List<CommentResponse> response = issueService.getIssueComments(id);
        return ResponseEntity.ok(ApiResponse.ok("Comments fetched successfully", response));
    }
}
