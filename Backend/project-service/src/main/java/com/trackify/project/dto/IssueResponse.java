package com.trackify.project.dto;

import com.trackify.project.enums.IssuePriority;
import com.trackify.project.enums.IssueStatus;
import java.time.LocalDateTime;

public class IssueResponse {
    private Long id;
    private String title;
    private String description;
    private IssueStatus status;
    private IssuePriority priority;
    private Long projectId;
    private String projectHeaderName;
    private Long reporterId;
    private Long assigneeId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public IssueResponse() {}

    public IssueResponse(Long id, String title, String description, IssueStatus status, IssuePriority priority, 
                        Long projectId, String projectHeaderName, Long reporterId, Long assigneeId, 
                        LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.status = status;
        this.priority = priority;
        this.projectId = projectId;
        this.projectHeaderName = projectHeaderName;
        this.reporterId = reporterId;
        this.assigneeId = assigneeId;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public static IssueResponseBuilder builder() {
        return new IssueResponseBuilder();
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
    public Long getProjectId() { return projectId; }
    public void setProjectId(Long projectId) { this.projectId = projectId; }
    public String getProjectHeaderName() { return projectHeaderName; }
    public void setProjectHeaderName(String projectHeaderName) { this.projectHeaderName = projectHeaderName; }
    public Long getReporterId() { return reporterId; }
    public void setReporterId(Long reporterId) { this.reporterId = reporterId; }
    public Long getAssigneeId() { return assigneeId; }
    public void setAssigneeId(Long assigneeId) { this.assigneeId = assigneeId; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public static class IssueResponseBuilder {
        private Long id;
        private String title;
        private String description;
        private IssueStatus status;
        private IssuePriority priority;
        private Long projectId;
        private String projectHeaderName;
        private Long reporterId;
        private Long assigneeId;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        public IssueResponseBuilder id(Long id) { this.id = id; return this; }
        public IssueResponseBuilder title(String title) { this.title = title; return this; }
        public IssueResponseBuilder description(String description) { this.description = description; return this; }
        public IssueResponseBuilder status(IssueStatus status) { this.status = status; return this; }
        public IssueResponseBuilder priority(IssuePriority priority) { this.priority = priority; return this; }
        public IssueResponseBuilder projectId(Long projectId) { this.projectId = projectId; return this; }
        public IssueResponseBuilder projectHeaderName(String projectHeaderName) { this.projectHeaderName = projectHeaderName; return this; }
        public IssueResponseBuilder reporterId(Long reporterId) { this.reporterId = reporterId; return this; }
        public IssueResponseBuilder assigneeId(Long assigneeId) { this.assigneeId = assigneeId; return this; }
        public IssueResponseBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
        public IssueResponseBuilder updatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; return this; }

        public IssueResponse build() {
            return new IssueResponse(id, title, description, status, priority, projectId, projectHeaderName, reporterId, assigneeId, createdAt, updatedAt);
        }
    }
}
