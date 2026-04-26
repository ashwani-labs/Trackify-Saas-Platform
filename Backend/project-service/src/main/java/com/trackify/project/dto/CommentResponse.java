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
public class CommentResponse {
  private Long id;
  private Long issueId;
  private Long userId;
  private String content;
  private LocalDateTime createdAt;
}
