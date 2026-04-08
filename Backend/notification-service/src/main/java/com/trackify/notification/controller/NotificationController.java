package com.trackify.notification.controller;

import com.trackify.common.dto.ApiResponse;
import com.trackify.notification.dto.EmailRequest;
import com.trackify.notification.service.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final EmailService emailService;

    @PostMapping("/email")
    public ResponseEntity<ApiResponse<String>> sendEmail(@RequestBody EmailRequest request) {
        // Run in separate thread or handle normally, kept synchronous for simplicity right now
        emailService.sendEmail(request);
        return ResponseEntity.ok(ApiResponse.ok("Email request processed", null));
    }
}
