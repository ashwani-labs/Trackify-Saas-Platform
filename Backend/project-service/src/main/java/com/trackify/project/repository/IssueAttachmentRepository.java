package com.trackify.project.repository;

import com.trackify.project.entity.IssueAttachment;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface IssueAttachmentRepository extends JpaRepository<IssueAttachment, Long> {
  List<IssueAttachment> findAllByIssueId(Long issueId);
}
