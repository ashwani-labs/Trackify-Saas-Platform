package com.trackify.project.repository;

import com.trackify.project.entity.Project;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {
  boolean existsByProjectKey(String projectKey);

  List<Project> findAllByOwnerId(Long ownerId);

  @Query(
      "SELECT p FROM Project p WHERE p.id IN (SELECT pm.projectId FROM ProjectMember pm WHERE pm.userId = :userId)")
  Page<Project> findByMemberUserId(@Param("userId") Long userId, Pageable pageable);

  @Query("SELECT pm.projectId FROM ProjectMember pm WHERE pm.userId = :userId")
  List<Long> findProjectIdsByUserId(@Param("userId") Long userId);

  @Query(
      "SELECT p FROM Project p WHERE LOWER(p.name) LIKE LOWER(CONCAT('%', :term, '%')) "
          + "OR LOWER(COALESCE(p.projectKey, '')) LIKE LOWER(CONCAT('%', :term, '%')) "
          + "OR LOWER(COALESCE(p.description, '')) LIKE LOWER(CONCAT('%', :term, '%'))")
  List<Project> searchAllByTerm(@Param("term") String term, Pageable pageable);

  @Query(
      "SELECT p FROM Project p WHERE p.id IN :projectIds AND ("
          + "LOWER(p.name) LIKE LOWER(CONCAT('%', :term, '%')) "
          + "OR LOWER(COALESCE(p.projectKey, '')) LIKE LOWER(CONCAT('%', :term, '%')) "
          + "OR LOWER(COALESCE(p.description, '')) LIKE LOWER(CONCAT('%', :term, '%')))")
  List<Project> searchByTermAndProjectIds(
      @Param("projectIds") List<Long> projectIds, @Param("term") String term, Pageable pageable);
}
