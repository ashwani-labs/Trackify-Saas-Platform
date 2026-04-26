package com.trackify.auth.controller;

import com.trackify.auth.dto.ChangePasswordRequest;
import com.trackify.auth.dto.ForgotPasswordRequest;
import com.trackify.auth.dto.LoginRequest;
import com.trackify.auth.dto.LoginResponse;
import com.trackify.auth.dto.ResetPasswordRequest;
import com.trackify.auth.service.AuthService;
import com.trackify.common.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

  private final AuthService authService;

  @PostMapping("/login")
  public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
    return ResponseEntity.ok(authService.login(request));
  }

  @PostMapping("/forgot-password")
  public ResponseEntity<ApiResponse<Void>> forgotPassword(
      @Valid @RequestBody ForgotPasswordRequest request) {
    authService.forgotPassword(request);
    return ResponseEntity.ok(ApiResponse.ok("Password reset email sent (if account exists)", null));
  }

  @PostMapping("/reset-password")
  public ResponseEntity<ApiResponse<Void>> resetPassword(
      @Valid @RequestBody ResetPasswordRequest request) {
    authService.resetPassword(request);
    return ResponseEntity.ok(ApiResponse.ok("Password reset successfully", null));
  }

  @PostMapping("/change-password")
  public ResponseEntity<ApiResponse<Void>> changePassword(
      @Valid @RequestBody ChangePasswordRequest request) {
    authService.changePassword(request);
    return ResponseEntity.ok(ApiResponse.ok("Password changed successfully", null));
  }
}
