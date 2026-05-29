package com.trackify.project.dto;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class GlobalSearchResponse {
  private List<ProjectResponse> projects;
  private List<IssueResponse> issues;
  private List<SearchUserResult> users;
}
