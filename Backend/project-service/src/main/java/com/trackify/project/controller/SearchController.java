package com.trackify.project.controller;

import com.trackify.common.dto.ApiResponse;
import com.trackify.common.security.JwtUtil;
import com.trackify.project.dto.GlobalSearchResponse;
import com.trackify.project.service.SearchService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/search")
@RequiredArgsConstructor
public class SearchController {

  private final SearchService searchService;
  private final JwtUtil jwtUtil;

  @GetMapping
  public ResponseEntity<ApiResponse<GlobalSearchResponse>> search(
      @RequestHeader("Authorization") String authHeader,
      @RequestParam("q") String query,
      @RequestParam(value = "limit", defaultValue = "8") int limit) {
    String token = authHeader.substring(7);
    Long userId = jwtUtil.extractUserId(token);
    String role = jwtUtil.extractRole(token);

    GlobalSearchResponse results = searchService.search(query, limit, userId, role);
    return ResponseEntity.ok(ApiResponse.ok("Search completed", results));
  }
}
