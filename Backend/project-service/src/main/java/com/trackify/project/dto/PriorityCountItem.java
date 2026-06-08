package com.trackify.project.dto;

import com.trackify.project.enums.IssuePriority;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PriorityCountItem {
  private IssuePriority priority;
  private long count;
}
