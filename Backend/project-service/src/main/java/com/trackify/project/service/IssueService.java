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

@Service
public class IssueService {

    private static final Logger log = LoggerFactory.getLogger(IssueService.class);
    private final IssueRepository issueRepository;
    private final ProjectRepository projectRepository;
    private final IssueCommentRepository commentRepository;

    public IssueService(IssueRepository issueRepository, 
                        ProjectRepository projectRepository, 
                        IssueCommentRepository commentRepository) {
        this.issueRepository = issueRepository;
        this.projectRepository = projectRepository;
        this.commentRepository = commentRepository;
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
