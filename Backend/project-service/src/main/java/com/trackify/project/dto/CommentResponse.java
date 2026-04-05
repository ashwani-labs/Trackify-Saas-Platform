package com.trackify.project.dto;

import java.time.LocalDateTime;

public class CommentResponse {
    private Long id;
    private Long issueId;
    private Long userId;
    private String content;
    private LocalDateTime createdAt;

    public CommentResponse() {}

    public CommentResponse(Long id, Long issueId, Long userId, String content, LocalDateTime createdAt) {
        this.id = id;
        this.issueId = issueId;
        this.userId = userId;
        this.content = content;
        this.createdAt = createdAt;
    }

    public static CommentResponseBuilder builder() {
        return new CommentResponseBuilder();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getIssueId() { return issueId; }
    public void setIssueId(Long issueId) { this.issueId = issueId; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public static class CommentResponseBuilder {
        private Long id;
        private Long issueId;
        private Long userId;
        private String content;
        private LocalDateTime createdAt;

        public CommentResponseBuilder id(Long id) { this.id = id; return this; }
        public CommentResponseBuilder issueId(Long issueId) { this.issueId = issueId; return this; }
        public CommentResponseBuilder userId(Long userId) { this.userId = userId; return this; }
        public CommentResponseBuilder content(String content) { this.content = content; return this; }
        public CommentResponseBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }

        public CommentResponse build() {
            return new CommentResponse(id, issueId, userId, content, createdAt);
        }
    }
}
