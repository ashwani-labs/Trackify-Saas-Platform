package com.trackify.project.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import org.hibernate.annotations.CreationTimestamp;

@Entity
@Table(name = "issue_comments")
public class IssueComment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "issue_id", nullable = false)
    private Issue issue;

    @Column(name = "user_id")
    private Long userId;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public IssueComment() {}

    public IssueComment(Long id, Issue issue, Long userId, String content, LocalDateTime createdAt) {
        this.id = id;
        this.issue = issue;
        this.userId = userId;
        this.content = content;
        this.createdAt = createdAt;
    }

    public static IssueCommentBuilder builder() {
        return new IssueCommentBuilder();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Issue getIssue() { return issue; }
    public void setIssue(Issue issue) { this.issue = issue; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public static class IssueCommentBuilder {
        private Long id;
        private Issue issue;
        private Long userId;
        private String content;
        private LocalDateTime createdAt;

        public IssueCommentBuilder id(Long id) { this.id = id; return this; }
        public IssueCommentBuilder issue(Issue issue) { this.issue = issue; return this; }
        public IssueCommentBuilder userId(Long userId) { this.userId = userId; return this; }
        public IssueCommentBuilder content(String content) { this.content = content; return this; }
        public IssueCommentBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }

        public IssueComment build() {
            return new IssueComment(id, issue, userId, content, createdAt);
        }
    }
}
