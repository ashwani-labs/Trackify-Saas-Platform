package com.trackify.project.dto;

import com.trackify.project.enums.IssuePriority;
import com.trackify.project.enums.IssueStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class IssueRequest {
    @NotBlank(message = "Issue title is required")
    private String title;
    private String description;
    
    private IssueStatus status;
    private IssuePriority priority;
    
    @NotNull(message = "Project ID is required")
    private Long projectId;
    
    private Long assigneeId;

    public IssueRequest() {}

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
    public Long getAssigneeId() { return assigneeId; }
    public void setAssigneeId(Long assigneeId) { this.assigneeId = assigneeId; }
}
