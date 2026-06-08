package com.trackify.project.controller;

import com.trackify.common.dto.ApiResponse;
import com.trackify.common.security.JwtUtil;
import com.trackify.project.dto.NotificationResponse;
import com.trackify.project.service.NotificationService;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/notifications")
@RequiredArgsConstructor
public class NotificationController {

  private final NotificationService notificationService;
  private final JwtUtil jwtUtil;

  @GetMapping
  public ResponseEntity<ApiResponse<Page<NotificationResponse>>> listNotifications(
      @RequestHeader("Authorization") String authHeader,
      @RequestParam(value = "unreadOnly", defaultValue = "false") boolean unreadOnly,
      Pageable pageable) {
    Long userId = jwtUtil.extractUserId(authHeader.substring(7));
    Page<NotificationResponse> page = notificationService.listForUser(userId, unreadOnly, pageable);
    return ResponseEntity.ok(ApiResponse.ok("Notifications fetched", page));
  }

  @GetMapping("/unread-count")
  public ResponseEntity<ApiResponse<Map<String, Long>>> getUnreadCount(
      @RequestHeader("Authorization") String authHeader) {
    Long userId = jwtUtil.extractUserId(authHeader.substring(7));
    long count = notificationService.getUnreadCount(userId);
    return ResponseEntity.ok(ApiResponse.ok("Unread count fetched", Map.of("count", count)));
  }

  @PatchMapping("/{id}/read")
  public ResponseEntity<ApiResponse<NotificationResponse>> markAsRead(
      @RequestHeader("Authorization") String authHeader, @PathVariable Long id) {
    Long userId = jwtUtil.extractUserId(authHeader.substring(7));
    return ResponseEntity.ok(
        ApiResponse.ok("Notification marked as read", notificationService.markAsRead(id, userId)));
  }

  @PatchMapping("/{id}/unread")
  public ResponseEntity<ApiResponse<NotificationResponse>> markAsUnread(
      @RequestHeader("Authorization") String authHeader, @PathVariable Long id) {
    Long userId = jwtUtil.extractUserId(authHeader.substring(7));
    return ResponseEntity.ok(
        ApiResponse.ok(
            "Notification marked as unread", notificationService.markAsUnread(id, userId)));
  }

  @PatchMapping("/read-all")
  public ResponseEntity<ApiResponse<Void>> markAllAsRead(
      @RequestHeader("Authorization") String authHeader) {
    Long userId = jwtUtil.extractUserId(authHeader.substring(7));
    notificationService.markAllAsRead(userId);
    return ResponseEntity.ok(ApiResponse.ok("All notifications marked as read", null));
  }
}
