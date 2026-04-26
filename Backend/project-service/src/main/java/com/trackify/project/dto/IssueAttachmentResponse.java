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
public class IssueAttachmentResponse {
  private Long id;
  private String fileName;
  private String contentType;
  private Long fileSize;
  private Long uploaderId;
  private LocalDateTime createdAt;
}
