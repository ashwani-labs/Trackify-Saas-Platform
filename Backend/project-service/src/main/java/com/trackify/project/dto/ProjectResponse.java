package com.trackify.project.dto;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ProjectResponse {
  private Long id;
  private String key;
  private String name;
  private String description;
  private Long ownerId;
  private LocalDateTime createdAt;
  private LocalDateTime updatedAt;
  private long totalIssues;
  private long todoCount;
  private long inProgressCount;
  private long doneCount;
  private long memberCount;
  private String lastActivitySummary;
  private LocalDateTime lastActivityAt;
}
