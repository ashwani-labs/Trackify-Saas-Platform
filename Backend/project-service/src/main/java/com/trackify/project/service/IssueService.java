package com.trackify.project.service;

import com.trackify.common.exception.AppException;
import com.trackify.project.dto.CommentRequest;
import com.trackify.project.dto.CommentResponse;
import com.trackify.project.dto.IssueRequest;
import com.trackify.project.dto.IssueResponse;
import com.trackify.project.entity.Issue;
import com.trackify.project.entity.IssueComment;
import com.trackify.project.entity.Project;
import com.trackify.project.enums.IssueStatus;
import com.trackify.project.repository.IssueCommentRepository;
import com.trackify.project.repository.IssueRepository;
import com.trackify.project.repository.ProjectRepository;
import java.util.List;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.jdbc.core.JdbcTemplate;
import javax.sql.DataSource;

@Service
public class IssueService {

    private final IssueRepository issueRepository;
    private final ProjectRepository projectRepository;
    private final IssueCommentRepository commentRepository;
    private final JdbcTemplate jdbcTemplate;

    public IssueService(IssueRepository issueRepository, 
                        ProjectRepository projectRepository, 
                        IssueCommentRepository commentRepository,
                        DataSource dataSource) {
        this.issueRepository = issueRepository;
        this.projectRepository = projectRepository;
        this.commentRepository = commentRepository;
        this.jdbcTemplate = new JdbcTemplate(dataSource);
    }

    @Transactional
    public IssueResponse createIssue(IssueRequest request, Long reporterId) {
        Project project = projectRepository.findById(request.getProjectId())
                .orElseThrow(() -> AppException.notFound("Project not found"));

        Issue issue = Issue.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .status(request.getStatus() != null ? request.getStatus() : IssueStatus.TODO)
                .priority(request.getPriority() != null ? request.getPriority() : com.trackify.project.enums.IssuePriority.MEDIUM)
                .project(project)
                .reporterId(reporterId)
                .assigneeId(request.getAssigneeId())
                .build();

        issue = issueRepository.save(issue);
        
        if (request.getAssigneeId() != null) {
            sendAssignmentEmail(request.getAssigneeId(), issue.getTitle());
        }
        
        return mapToResponse(issue);
    }

    public List<IssueResponse> getIssuesByProject(Long projectId) {
        return issueRepository.findAllByProjectId(projectId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public IssueResponse getIssueById(Long id) {
        Issue issue = issueRepository.findById(id)
                .orElseThrow(() -> AppException.notFound("Issue not found"));
        return mapToResponse(issue);
    }

    @Transactional
    public IssueResponse updateIssue(Long id, IssueRequest request) {
        Issue issue = issueRepository.findById(id)
                .orElseThrow(() -> AppException.notFound("Issue not found"));

        issue.setTitle(request.getTitle());
        issue.setDescription(request.getDescription());
        if (request.getStatus() != null) issue.setStatus(request.getStatus());
        if (request.getPriority() != null) issue.setPriority(request.getPriority());
        issue.setAssigneeId(request.getAssigneeId());

        issue = issueRepository.save(issue);
        
        if (request.getAssigneeId() != null) {
            sendAssignmentEmail(request.getAssigneeId(), issue.getTitle());
        }
        
        return mapToResponse(issue);
    }

    @Transactional
    public void deleteIssue(Long id) {
        if (!issueRepository.existsById(id)) {
            throw AppException.notFound("Issue not found");
        }
        issueRepository.deleteById(id);
    }

    @Transactional
    public CommentResponse addComment(Long issueId, CommentRequest request, Long userId) {
        Issue issue = issueRepository.findById(issueId)
                .orElseThrow(() -> AppException.notFound("Issue not found"));

        IssueComment comment = IssueComment.builder()
                .issue(issue)
                .userId(userId)
                .content(request.getContent())
                .build();

        comment = commentRepository.save(comment);
        return mapToCommentResponse(comment);
    }

    public List<CommentResponse> getIssueComments(Long issueId) {
        return commentRepository.findAllByIssueIdOrderByCreatedAtDesc(issueId).stream()
                .map(this::mapToCommentResponse)
                .collect(Collectors.toList());
    }

    private void sendAssignmentEmail(Long assigneeId, String issueTitle) {
        try {
            String email = jdbcTemplate.queryForObject("SELECT email FROM users WHERE id = ?", String.class, assigneeId);
            if (email != null) {
                org.springframework.web.client.RestTemplate restTemplate = new org.springframework.web.client.RestTemplate();
                java.util.Map<String, String> request = new java.util.HashMap<>();
                request.put("to", email);
                request.put("subject", "Task Assigned: " + issueTitle);
                request.put("body", "You have been assigned to: " + issueTitle + "\n\nLog in to your dashboard to view details.");
                
                restTemplate.postForEntity("http://localhost:8084/api/notifications/email", request, String.class);
            }
        } catch (Exception e) {
            LoggerFactory.getLogger(IssueService.class).error("Failed to send assignment email: {}", e.getMessage());
        }
    }

    private IssueResponse mapToResponse(Issue issue) {
        return IssueResponse.builder()
                .id(issue.getId())
                .title(issue.getTitle())
                .description(issue.getDescription())
                .status(issue.getStatus())
                .priority(issue.getPriority())
                .projectId(issue.getProject().getId())
                .projectHeaderName(issue.getProject().getName())
                .reporterId(issue.getReporterId())
                .assigneeId(issue.getAssigneeId())
                .createdAt(issue.getCreatedAt())
                .updatedAt(issue.getUpdatedAt())
                .build();
    }

    private CommentResponse mapToCommentResponse(IssueComment comment) {
        return CommentResponse.builder()
                .id(comment.getId())
                .issueId(comment.getIssue().getId())
                .userId(comment.getUserId())
                .content(comment.getContent())
                .createdAt(comment.getCreatedAt())
                .build();
    }
}
