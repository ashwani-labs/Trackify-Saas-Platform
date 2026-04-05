package com.trackify.project.entity;

import com.trackify.project.enums.IssuePriority;
import com.trackify.project.enums.IssueStatus;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

@Entity
@Table(name = "issues")
public class Issue {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    private IssueStatus status = IssueStatus.TODO;

    @Enumerated(EnumType.STRING)
    private IssuePriority priority = IssuePriority.MEDIUM;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @Column(name = "reporter_id")
    private Long reporterId;

    @Column(name = "assignee_id")
    private Long assigneeId;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public Issue() {}

    public Issue(Long id, String title, String description, IssueStatus status, IssuePriority priority, 
                 Project project, Long reporterId, Long assigneeId, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.status = status;
        this.priority = priority;
        this.project = project;
        this.reporterId = reporterId;
        this.assigneeId = assigneeId;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public static IssueBuilder builder() {
        return new IssueBuilder();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public IssueStatus getStatus() { return status; }
    public void setStatus(IssueStatus status) { this.status = status; }
    public IssuePriority getPriority() { return priority; }
    public void setPriority(IssuePriority priority) { this.priority = priority; }
    public Project getProject() { return project; }
    public void setProject(Project project) { this.project = project; }
    public Long getReporterId() { return reporterId; }
    public void setReporterId(Long reporterId) { this.reporterId = reporterId; }
    public Long getAssigneeId() { return assigneeId; }
    public void setAssigneeId(Long assigneeId) { this.assigneeId = assigneeId; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public static class IssueBuilder {
        private Long id;
        private String title;
        private String description;
        private IssueStatus status = IssueStatus.TODO;
        private IssuePriority priority = IssuePriority.MEDIUM;
        private Project project;
        private Long reporterId;
        private Long assigneeId;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        public IssueBuilder id(Long id) { this.id = id; return this; }
        public IssueBuilder title(String title) { this.title = title; return this; }
        public IssueBuilder description(String description) { this.description = description; return this; }
        public IssueBuilder status(IssueStatus status) { this.status = status; return this; }
        public IssueBuilder priority(IssuePriority priority) { this.priority = priority; return this; }
        public IssueBuilder project(Project project) { this.project = project; return this; }
        public IssueBuilder reporterId(Long reporterId) { this.reporterId = reporterId; return this; }
        public IssueBuilder assigneeId(Long assigneeId) { this.assigneeId = assigneeId; return this; }
        public IssueBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
        public IssueBuilder updatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; return this; }

        public Issue build() {
            return new Issue(id, title, description, status, priority, project, reporterId, assigneeId, createdAt, updatedAt);
        }
    }
}
