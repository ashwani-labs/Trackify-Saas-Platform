package com.trackify.project.repository;

import com.trackify.project.entity.ProjectMember;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProjectMemberRepository extends JpaRepository<ProjectMember, Long> {
  List<ProjectMember> findAllByProjectId(Long projectId);

  Optional<ProjectMember> findByProjectIdAndUserId(Long projectId, Long userId);

  boolean existsByProjectIdAndUserId(Long projectId, Long userId);

  void deleteByProjectIdAndUserId(Long projectId, Long userId);
}
