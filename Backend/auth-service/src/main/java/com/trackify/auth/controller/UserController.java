package com.trackify.auth.controller;

import com.trackify.auth.service.AuthService;
import com.trackify.auth.service.FileStorageService;
import com.trackify.common.dto.ApiResponse;
import com.trackify.common.security.JwtUtil;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.multipart.MultipartFile;

@Slf4j
@RestController
@RequestMapping("/auth/profile")
@RequiredArgsConstructor
public class UserController {

  private final AuthService authService;
  private final FileStorageService storageService;
  private final JwtUtil jwtUtil;

  @Value("${auth.profile-photo-url-pattern:http://localhost:8081/auth/profile/photo/%s}")
  private String photoUrlPattern;

  @PostMapping("/photo")
  public ResponseEntity<ApiResponse<Map<String, String>>> uploadPhoto(
      @RequestHeader("Authorization") String authHeader, @RequestPart("file") MultipartFile file) {

    String token = authHeader.substring(7);
    String email = jwtUtil.extractEmail(token);

    String fileName = storageService.store(file);
    String photoUrl = String.format(photoUrlPattern, fileName);

    authService.updateProfilePhoto(email, photoUrl);

    return ResponseEntity.ok(
        ApiResponse.ok("Photo uploaded successfully", Map.of("url", photoUrl)));
  }
}
