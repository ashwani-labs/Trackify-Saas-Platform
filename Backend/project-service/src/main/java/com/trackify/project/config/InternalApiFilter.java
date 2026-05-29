package com.trackify.project.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
public class InternalApiFilter extends OncePerRequestFilter {

  @Value("${trackify.internal-api-key:}")
  private String internalApiKey;

  @Override
  protected boolean shouldNotFilter(HttpServletRequest request) {
    return !request.getRequestURI().startsWith("/internal/");
  }

  @Override
  protected void doFilterInternal(
      HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
      throws ServletException, IOException {
    String providedKey = request.getHeader("X-Internal-Api-Key");
    if (internalApiKey == null
        || internalApiKey.isBlank()
        || providedKey == null
        || !internalApiKey.equals(providedKey)) {
      response.setStatus(HttpStatus.UNAUTHORIZED.value());
      response.setContentType("application/json");
      response.getWriter().write("{\"success\":false,\"message\":\"Invalid internal API key\"}");
      return;
    }

    String tenantHeader = request.getHeader("X-Tenant-Id");
    if (tenantHeader == null || tenantHeader.isBlank()) {
      response.setStatus(HttpStatus.BAD_REQUEST.value());
      response.setContentType("application/json");
      response.getWriter().write("{\"success\":false,\"message\":\"X-Tenant-Id header required\"}");
      return;
    }

    try {
      TenantContext.set(Long.parseLong(tenantHeader));
      filterChain.doFilter(request, response);
    } catch (NumberFormatException e) {
      response.setStatus(HttpStatus.BAD_REQUEST.value());
      response.setContentType("application/json");
      response.getWriter().write("{\"success\":false,\"message\":\"Invalid X-Tenant-Id\"}");
    } finally {
      TenantContext.clear();
    }
  }
}
