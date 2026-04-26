package com.trackify.project.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "issue_attachments")
public class IssueAttachment {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false)
  private String fileName;

  @Column(nullable = false)
  private String fileKey; // Relative path or S3 key

  private String contentType;

  private Long fileSize;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "issue_id", nullable = false)
  private Issue issue;

  @Column(name = "uploader_id")
  private Long uploaderId;

  @CreationTimestamp
  @Column(name = "created_at", updatable = false)
  private LocalDateTime createdAt;
}
