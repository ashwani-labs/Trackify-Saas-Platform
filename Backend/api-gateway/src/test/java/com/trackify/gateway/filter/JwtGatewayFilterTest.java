package com.trackify.gateway.filter;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.trackify.common.security.JwtUtil;
import jakarta.servlet.FilterChain;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.core.context.SecurityContextHolder;

@ExtendWith(MockitoExtension.class)
class JwtGatewayFilterTest {

  @Mock private JwtUtil jwtUtil;
  @Mock private FilterChain filterChain;

  @AfterEach
  void clearSecurityContext() {
    SecurityContextHolder.clearContext();
  }

  @Test
  void doFilterInternal_returnsUnauthorized_whenAuthorizationHeaderMissing() throws Exception {
    JwtGatewayFilter filter = new JwtGatewayFilter(jwtUtil);
    MockHttpServletRequest request = new MockHttpServletRequest("GET", "/projects");
    MockHttpServletResponse response = new MockHttpServletResponse();

    filter.doFilterInternal(request, response, filterChain);

    assertEquals(401, response.getStatus());
    verify(filterChain, never()).doFilter(request, response);
  }

  @Test
  void doFilterInternal_allowsProtectedRequest_whenTokenIsValid() throws Exception {
    JwtGatewayFilter filter = new JwtGatewayFilter(jwtUtil);
    MockHttpServletRequest request = new MockHttpServletRequest("GET", "/projects");
    request.addHeader("Authorization", "Bearer valid-token");
    MockHttpServletResponse response = new MockHttpServletResponse();

    when(jwtUtil.isTokenValid("valid-token")).thenReturn(true);
    when(jwtUtil.extractSubject("valid-token")).thenReturn("user@trackify.com");
    when(jwtUtil.extractRole("valid-token")).thenReturn("ADMIN");

    filter.doFilterInternal(request, response, filterChain);

    verify(filterChain).doFilter(request, response);
    assertNotNull(SecurityContextHolder.getContext().getAuthentication());
    assertEquals(
        "user@trackify.com", SecurityContextHolder.getContext().getAuthentication().getName());
  }

  @Test
  void doFilterInternal_allowsPublicAuthRoute_withoutToken() throws Exception {
    JwtGatewayFilter filter = new JwtGatewayFilter(jwtUtil);
    MockHttpServletRequest request = new MockHttpServletRequest("POST", "/auth/login");
    MockHttpServletResponse response = new MockHttpServletResponse();

    filter.doFilterInternal(request, response, filterChain);

    verify(filterChain).doFilter(request, response);
    assertEquals(200, response.getStatus());
  }
}
