package com.trackify.project.entity;

import com.trackify.project.enums.ActivityEventType;
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
@Table(name = "activity_events")
public class ActivityEvent {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(name = "project_id", nullable = false)
  private Long projectId;

  @Column(name = "issue_id")
  private Long issueId;

  @Column(name = "actor_user_id")
  private Long actorUserId;

  @Enumerated(EnumType.STRING)
  @Column(name = "event_type", nullable = false)
  private ActivityEventType eventType;

  @Column(nullable = false)
  private String summary;

  @CreationTimestamp
  @Column(name = "created_at", updatable = false)
  private LocalDateTime createdAt;
}
