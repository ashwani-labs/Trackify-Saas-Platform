package com.trackify.project.service;

import com.trackify.common.exception.AppException;
import com.trackify.project.dto.AddMemberRequest;
import com.trackify.project.dto.ProjectMemberResponse;
import com.trackify.project.entity.ProjectMember;
import com.trackify.project.repository.ProjectMemberRepository;
import com.trackify.project.repository.ProjectRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProjectMemberService {

  private final ProjectMemberRepository memberRepository;
  private final ProjectRepository projectRepository;

  public List<ProjectMemberResponse> getProjectMembers(Long projectId) {
    if (!projectRepository.existsById(projectId)) {
      throw AppException.notFound("Project not found");
    }
    return memberRepository.findAllByProjectId(projectId).stream()
        .map(this::mapToResponse)
        .toList();
  }

  @Transactional
  public ProjectMemberResponse addMember(Long projectId, AddMemberRequest request) {
    if (!projectRepository.existsById(projectId)) {
      throw AppException.notFound("Project not found");
    }
    if (memberRepository.existsByProjectIdAndUserId(projectId, request.getUserId())) {
      throw AppException.conflict("User is already a member of this project");
    }

    ProjectMember member =
        ProjectMember.builder()
            .projectId(projectId)
            .userId(request.getUserId())
            .userEmail(request.getUserEmail())
            .userName(request.getUserName())
            .userRole(request.getUserRole())
            .build();

    member = memberRepository.save(member);
    log.info("Added user {} to project {}", request.getUserId(), projectId);
    return mapToResponse(member);
  }

  @Transactional
  public void removeMember(Long projectId, Long userId) {
    if (!memberRepository.existsByProjectIdAndUserId(projectId, userId)) {
      throw AppException.notFound("Member not found in this project");
    }
    memberRepository.deleteByProjectIdAndUserId(projectId, userId);
    log.info("Removed user {} from project {}", userId, projectId);
  }

  private ProjectMemberResponse mapToResponse(ProjectMember member) {
    return ProjectMemberResponse.builder()
        .id(member.getId())
        .projectId(member.getProjectId())
        .userId(member.getUserId())
        .userEmail(member.getUserEmail())
        .userName(member.getUserName())
        .userRole(member.getUserRole())
        .addedAt(member.getAddedAt())
        .build();
  }
}
