package com.trackify.project.controller;

import com.trackify.common.dto.ApiResponse;
import com.trackify.project.dto.UserApprovalNotificationRequest;
import com.trackify.project.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/internal/notifications")
@RequiredArgsConstructor
public class InternalNotificationController {

  private final NotificationService notificationService;

  @PostMapping("/user-approval")
  public ResponseEntity<ApiResponse<Void>> notifyUserApproval(
      @RequestBody UserApprovalNotificationRequest request) {
    notificationService.notifyUserApprovalPending(
        request.getPendingUserId(), request.getEmail(), request.getFullName());
    return ResponseEntity.ok(ApiResponse.ok("Admin notifications created", null));
  }
}
