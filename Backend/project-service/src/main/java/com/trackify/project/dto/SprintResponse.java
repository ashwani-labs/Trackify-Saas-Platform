package com.trackify.project.dto;

import com.trackify.project.enums.SprintStatus;
import java.time.LocalDate;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class SprintResponse {
  private Long id;
  private String name;
  private String goal;
  private LocalDate startDate;
  private LocalDate endDate;
  private SprintStatus status;
  private Long projectId;
  private LocalDateTime createdAt;
  private LocalDateTime updatedAt;
}
