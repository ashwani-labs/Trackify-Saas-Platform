package com.trackify.project.controller;

import com.trackify.common.dto.ApiResponse;
import com.trackify.common.exception.AppException;
import com.trackify.common.security.JwtUtil;
import com.trackify.project.dto.ActivityEventResponse;
import com.trackify.project.service.ActivityService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/activity")
@RequiredArgsConstructor
public class WorkspaceActivityController {

  private final ActivityService activityService;
  private final JwtUtil jwtUtil;

  @GetMapping("/workspace")
  public ResponseEntity<ApiResponse<Page<ActivityEventResponse>>> getWorkspaceActivity(
      @RequestHeader("Authorization") String authHeader, Pageable pageable) {
    String role = jwtUtil.extractRole(authHeader.substring(7));
    if (!"ADMIN".equalsIgnoreCase(role) && !"MASTER".equalsIgnoreCase(role)) {
      throw AppException.forbidden("Only workspace admins can view the audit log");
    }
    Page<ActivityEventResponse> response = activityService.getWorkspaceActivity(pageable);
    return ResponseEntity.ok(ApiResponse.ok("Workspace activity fetched", response));
  }
}
