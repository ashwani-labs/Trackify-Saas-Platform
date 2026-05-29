package com.trackify.project.entity;

import com.trackify.project.enums.NotificationReferenceType;
import com.trackify.project.enums.NotificationType;
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
@Table(name = "notifications")
public class Notification {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(name = "user_id", nullable = false)
  private Long userId;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private NotificationType type;

  @Column(nullable = false)
  private String title;

  @Column(columnDefinition = "TEXT")
  private String message;

  @Enumerated(EnumType.STRING)
  @Column(name = "reference_type")
  private NotificationReferenceType referenceType;

  @Column(name = "reference_id")
  private Long referenceId;

  @Column(name = "project_id")
  private Long projectId;

  @Column(name = "read_at")
  private LocalDateTime readAt;

  @CreationTimestamp
  @Column(name = "created_at", updatable = false)
  private LocalDateTime createdAt;
}
