package com.trackify.project.controller;

import com.trackify.common.dto.ApiResponse;
import com.trackify.common.security.JwtUtil;
import com.trackify.project.dto.CommentRequest;
import com.trackify.project.dto.CommentResponse;
import com.trackify.project.dto.IssueAttachmentResponse;
import com.trackify.project.dto.IssueRequest;
import com.trackify.project.dto.IssueResponse;
import com.trackify.project.service.IssueService;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/issues")
@RequiredArgsConstructor
public class IssueController {

  private final IssueService issueService;
  private final JwtUtil jwtUtil;

  @PostMapping
  public ResponseEntity<ApiResponse<IssueResponse>> createIssue(
      @RequestHeader("Authorization") String authHeader, @Valid @RequestBody IssueRequest request) {

    Long userId = jwtUtil.extractUserId(authHeader.substring(7));
    IssueResponse response = issueService.createIssue(request, userId);
    return ResponseEntity.ok(ApiResponse.ok("Issue created successfully", response));
  }

  @GetMapping("/project/{projectId}/labels")
  public ResponseEntity<ApiResponse<List<String>>> getProjectLabels(@PathVariable Long projectId) {
    return ResponseEntity.ok(
        ApiResponse.ok("Project labels fetched", issueService.getProjectLabels(projectId)));
  }

  @GetMapping("/project/{projectId}")
  public ResponseEntity<ApiResponse<List<IssueResponse>>> getIssuesByProject(
      @PathVariable Long projectId) {
    List<IssueResponse> response = issueService.getIssuesByProject(projectId);
    return ResponseEntity.ok(ApiResponse.ok("Issues fetched successfully", response));
  }

  @GetMapping("/project/{projectId}/paged")
  public ResponseEntity<ApiResponse<org.springframework.data.domain.Page<IssueResponse>>>
      getIssuesByProjectPaged(
          @PathVariable Long projectId, org.springframework.data.domain.Pageable pageable) {
    org.springframework.data.domain.Page<IssueResponse> response =
        issueService.getIssuesByProject(projectId, pageable);
    return ResponseEntity.ok(ApiResponse.ok("Issues fetched successfully", response));
  }

  @GetMapping("/{id}")
  public ResponseEntity<ApiResponse<IssueResponse>> getIssueById(@PathVariable Long id) {
    IssueResponse response = issueService.getIssueById(id);
    return ResponseEntity.ok(ApiResponse.ok("Issue fetched successfully", response));
  }

  @GetMapping("/key/{issueKey}")
  public ResponseEntity<ApiResponse<IssueResponse>> getIssueByKey(@PathVariable String issueKey) {
    IssueResponse response = issueService.getIssueByKey(issueKey);
    return ResponseEntity.ok(ApiResponse.ok("Issue fetched successfully", response));
  }

  @PutMapping("/{id}")
  public ResponseEntity<ApiResponse<IssueResponse>> updateIssue(
      @RequestHeader("Authorization") String authHeader,
      @PathVariable Long id,
      @Valid @RequestBody IssueRequest request) {
    Long userId = jwtUtil.extractUserId(authHeader.substring(7));
    IssueResponse response = issueService.updateIssue(id, request, userId);
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
  public ResponseEntity<ApiResponse<List<CommentResponse>>> getIssueComments(
      @PathVariable Long id) {
    List<CommentResponse> response = issueService.getIssueComments(id);
    return ResponseEntity.ok(ApiResponse.ok("Comments fetched successfully", response));
  }

  // --- Attachments ---

  @PostMapping("/{id}/attachments")
  public ResponseEntity<ApiResponse<IssueAttachmentResponse>> uploadAttachment(
      @RequestHeader("Authorization") String authHeader,
      @PathVariable Long id,
      @RequestParam("file") MultipartFile file) {

    Long userId = jwtUtil.extractUserId(authHeader.substring(7));
    IssueAttachmentResponse response = issueService.addAttachment(id, file, userId);
    return ResponseEntity.ok(ApiResponse.ok("Attachment uploaded successfully", response));
  }

  @GetMapping("/{id}/attachments")
  public ResponseEntity<ApiResponse<List<IssueAttachmentResponse>>> getIssueAttachments(
      @PathVariable Long id) {
    List<IssueAttachmentResponse> response = issueService.getIssueAttachments(id);
    return ResponseEntity.ok(ApiResponse.ok("Attachments fetched successfully", response));
  }

  @GetMapping("/attachments/{attachmentId}/download")
  public ResponseEntity<Resource> downloadAttachment(@PathVariable Long attachmentId) {
    Resource resource = issueService.downloadAttachment(attachmentId);

    return ResponseEntity.ok()
        .contentType(MediaType.APPLICATION_OCTET_STREAM)
        .header(
            HttpHeaders.CONTENT_DISPOSITION,
            "attachment; filename=\"" + resource.getFilename() + "\"")
        .body(resource);
  }

  @DeleteMapping("/attachments/{attachmentId}")
  public ResponseEntity<ApiResponse<Void>> deleteAttachment(@PathVariable Long attachmentId) {
    issueService.deleteAttachment(attachmentId);
    return ResponseEntity.ok(ApiResponse.ok("Attachment deleted successfully", null));
  }
}
