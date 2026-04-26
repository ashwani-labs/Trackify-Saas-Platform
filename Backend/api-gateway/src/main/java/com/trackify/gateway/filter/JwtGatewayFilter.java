package com.trackify.gateway.filter;

import com.trackify.common.security.JwtUtil;
import jakarta.annotation.Nonnull;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Collections;
import lombok.RequiredArgsConstructor;
import org.springframework.core.annotation.Order;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
@Order(1)
@RequiredArgsConstructor
public class JwtGatewayFilter extends OncePerRequestFilter {

  private final JwtUtil jwtUtil;

  @Override
  protected void doFilterInternal(
      HttpServletRequest request,
      @Nonnull HttpServletResponse response,
      @Nonnull FilterChain filterChain)
      throws ServletException, IOException {

    String path = request.getRequestURI();

    if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
      filterChain.doFilter(request, response);
      return;
    }

    if (path.startsWith("/auth/") || path.startsWith("/tenants/users/register")) {
      filterChain.doFilter(request, response);
      return;
    }

    final String authHeader = request.getHeader("Authorization");

    if (authHeader == null || !authHeader.startsWith("Bearer ")) {
      response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
      response
          .getWriter()
          .write("{\"success\":false,\"message\":\"Missing or invalid Authorization header\"}");
      response.setContentType("application/json");
      return;
    }

    final String token = authHeader.substring(7);

    if (!jwtUtil.isTokenValid(token)) {
      response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
      response.getWriter().write("{\"success\":false,\"message\":\"Invalid or expired token\"}");
      response.setContentType("application/json");
      return;
    }

    // Set the authentication in SecurityContext so that SecurityConfig permits the request
    String email = jwtUtil.extractSubject(token);
    String role = jwtUtil.extractRole(token);
    if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
      UsernamePasswordAuthenticationToken authentication =
          new UsernamePasswordAuthenticationToken(
              email, null, Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + role)));
      authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
      SecurityContextHolder.getContext().setAuthentication(authentication);
    }

    filterChain.doFilter(request, response);
  }
}
