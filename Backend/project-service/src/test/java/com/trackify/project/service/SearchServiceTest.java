package com.trackify.project.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.contains;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

import com.trackify.project.dto.GlobalSearchResponse;
import com.trackify.project.entity.Project;
import com.trackify.project.repository.IssueRepository;
import com.trackify.project.repository.ProjectRepository;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Pageable;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;

@ExtendWith(MockitoExtension.class)
class SearchServiceTest {

  @Mock private ProjectRepository projectRepository;
  @Mock private IssueRepository issueRepository;
  @Mock private JdbcTemplate jdbcTemplate;

  @Mock
  private org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate
      namedParameterJdbcTemplate;

  @InjectMocks private SearchService searchService;

  @Test
  void search_returnsEmptyLists_whenQueryBlank() {
    GlobalSearchResponse response = searchService.search("   ", 8, 1L, "USER");

    assertTrue(response.getProjects().isEmpty());
    assertTrue(response.getIssues().isEmpty());
    assertTrue(response.getUsers().isEmpty());
  }

  @Test
  void search_returnsAdminProjectMatches() {
    Project project = Project.builder().id(1L).name("Alpha").description("Core").build();
    when(projectRepository.searchAllByTerm(eq("alp"), any(Pageable.class)))
        .thenReturn(List.of(project));
    when(issueRepository.searchAllByTerm(eq("alp"), any(Pageable.class))).thenReturn(List.of());
    when(jdbcTemplate.query(contains("users u"), any(RowMapper.class), any(), any(), anyInt()))
        .thenReturn(List.of());
    when(jdbcTemplate.query(contains("FROM users"), any(RowMapper.class), any(), any(), anyInt()))
        .thenReturn(List.of());

    GlobalSearchResponse response = searchService.search("alp", 8, 99L, "ADMIN");

    assertEquals(1, response.getProjects().size());
    assertEquals("Alpha", response.getProjects().get(0).getName());
  }

  @Test
  void search_memberWithNoProjects_returnsEmptyProjects() {
    when(projectRepository.findProjectIdsByUserId(5L)).thenReturn(List.of());
    when(jdbcTemplate.query(anyString(), any(RowMapper.class), any(), any(), anyInt()))
        .thenReturn(List.of());

    GlobalSearchResponse response = searchService.search("task", 8, 5L, "USER");

    assertTrue(response.getProjects().isEmpty());
    assertTrue(response.getIssues().isEmpty());
  }
}
