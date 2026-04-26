package com.trackify.project.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class SprintRequest {
  @NotBlank(message = "Sprint name is required")
  private String name;

  private String goal;
  private LocalDate startDate;
  private LocalDate endDate;

  @NotNull(message = "Project ID is required")
  private Long projectId;
}
