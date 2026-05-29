package com.trackify.tenant.controller;

import com.trackify.common.dto.ApiResponse;
import com.trackify.common.enums.UserStatus;
import com.trackify.tenant.dto.CreateTenantRequest;
import com.trackify.tenant.dto.TenantDashboardStatsResponse;
import com.trackify.tenant.dto.TenantResponse;
import com.trackify.tenant.dto.UpdateTenantStatusRequest;
import com.trackify.tenant.dto.UserRegistrationRequest;
import com.trackify.tenant.dto.UserResponse;
import com.trackify.tenant.service.TenantService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/tenants")
@RequiredArgsConstructor
public class TenantController {

  private final TenantService tenantService;

  @PostMapping
  public ResponseEntity<ApiResponse<TenantResponse>> createTenant(
      @Valid @RequestBody CreateTenantRequest request) {
    TenantResponse response = tenantService.createTenant(request);
    return ResponseEntity.status(HttpStatus.CREATED)
        .body(ApiResponse.ok("Tenant created successfully", response));
  }

  @GetMapping
  public ResponseEntity<ApiResponse<Page<TenantResponse>>> getAllTenants(Pageable pageable) {
    return ResponseEntity.ok(ApiResponse.ok(tenantService.getAllTenants(pageable)));
  }

  @GetMapping("/dashboard-stats")
  public ResponseEntity<ApiResponse<TenantDashboardStatsResponse>> getDashboardStats(
      @RequestParam(value = "months", defaultValue = "6") int months) {
    return ResponseEntity.ok(ApiResponse.ok(tenantService.getDashboardStats(months)));
  }

  @GetMapping("/{id}")
  public ResponseEntity<ApiResponse<TenantResponse>> getTenant(@PathVariable("id") Long id) {
    return ResponseEntity.ok(ApiResponse.ok(tenantService.getTenantById(id)));
  }

  @PatchMapping("/{id}/status")
  public ResponseEntity<ApiResponse<TenantResponse>> updateTenantStatus(
      @PathVariable("id") Long id, @Valid @RequestBody UpdateTenantStatusRequest request) {
    return ResponseEntity.ok(
        ApiResponse.ok(
            "Tenant status updated successfully", tenantService.updateTenantStatus(id, request)));
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<ApiResponse<Void>> deleteTenant(@PathVariable("id") Long id) {
    tenantService.deleteTenant(id);
    return ResponseEntity.ok(ApiResponse.ok("Organization deleted permanently", null));
  }

  @PostMapping("/users/register")
  public ResponseEntity<ApiResponse<UserResponse>> registerUser(
      @Valid @RequestBody UserRegistrationRequest request) {
    return ResponseEntity.status(HttpStatus.CREATED)
        .body(
            ApiResponse.ok(
                "User registered successfully. Pending approval.",
                tenantService.registerUser(request)));
  }

  @GetMapping("/{id}/users/pending")
  public ResponseEntity<ApiResponse<Page<UserResponse>>> getPendingUsers(
      @PathVariable("id") Long id, Pageable pageable) {
    return ResponseEntity.ok(ApiResponse.ok(tenantService.getPendingUsers(id, pageable)));
  }

  @GetMapping("/{id}/users")
  public ResponseEntity<ApiResponse<Page<UserResponse>>> getAllUsers(
      @PathVariable("id") Long id, Pageable pageable) {
    return ResponseEntity.ok(ApiResponse.ok(tenantService.getAllUsers(id, pageable)));
  }

  @PatchMapping("/{id}/users/{userId}/status")
  public ResponseEntity<ApiResponse<UserResponse>> updateUserStatus(
      @PathVariable("id") Long id,
      @PathVariable("userId") Long userId,
      @RequestParam("status") UserStatus status) {
    return ResponseEntity.ok(
        ApiResponse.ok(
            "User status updated successfully",
            tenantService.updateUserStatus(id, userId, status)));
  }
}
