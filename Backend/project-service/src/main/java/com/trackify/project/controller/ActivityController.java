package com.trackify.project.controller;

import com.trackify.common.dto.ApiResponse;
import com.trackify.project.dto.ActivityEventResponse;
import com.trackify.project.service.ActivityService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/issues")
@RequiredArgsConstructor
public class ActivityController {

  private final ActivityService activityService;

  @GetMapping("/{issueId}/activity")
  public ResponseEntity<ApiResponse<List<ActivityEventResponse>>> getIssueActivity(
      @PathVariable Long issueId) {
    return ResponseEntity.ok(
        ApiResponse.ok("Activity fetched", activityService.getIssueActivity(issueId)));
  }
}
