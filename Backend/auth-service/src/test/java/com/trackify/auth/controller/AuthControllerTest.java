package com.trackify.auth.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.trackify.auth.dto.LoginRequest;
import com.trackify.auth.dto.LoginResponse;
import com.trackify.auth.service.AuthService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(controllers = AuthController.class)
@AutoConfigureMockMvc(addFilters = false) // Disable security filters for unit test
class AuthControllerTest {

  @Autowired private MockMvc mockMvc;

  @MockBean private AuthService authService;

  @MockBean private com.trackify.auth.repository.MasterUserRepository masterUserRepository;
  @MockBean private com.trackify.auth.repository.TenantRepository tenantRepository;
  @MockBean private com.trackify.auth.repository.UserLookupRepository userLookupRepository;
  @MockBean private com.trackify.common.security.JwtUtil jwtUtil;

  @Autowired private ObjectMapper objectMapper;

  @Test
  void testLogin_Success() throws Exception {
    LoginRequest request = new LoginRequest();
    request.setEmail("test@trackify.com");
    request.setPassword("password123");

    LoginResponse response =
        LoginResponse.builder()
            .token("mock-token")
            .role("EMPLOYEE")
            .tenantId(1L)
            .domain("testcorp")
            .build();

    when(authService.login(any(LoginRequest.class))).thenReturn(response);

    mockMvc
        .perform(
            post("/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.success").value(true))
        .andExpect(jsonPath("$.data.token").value("mock-token"))
        .andExpect(jsonPath("$.data.role").value("EMPLOYEE"))
        .andExpect(jsonPath("$.data.domain").value("testcorp"));
  }
}
