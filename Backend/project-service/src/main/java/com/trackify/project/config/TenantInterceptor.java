package com.trackify.project.config;

import com.trackify.common.security.JwtUtil;
import jakarta.annotation.Nonnull;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

/** Interceptor to extract the tenant_id from the JWT and set the TenantContext. */
@Component
public class TenantInterceptor implements HandlerInterceptor {

  private final JwtUtil jwtUtil;

  public TenantInterceptor(JwtUtil jwtUtil) {
    this.jwtUtil = jwtUtil;
  }

  @Override
  public boolean preHandle(
      HttpServletRequest request, @Nonnull HttpServletResponse response, @Nonnull Object handler) {
    String authHeader = request.getHeader("Authorization");

    if (authHeader != null && authHeader.startsWith("Bearer ")) {
      String token = authHeader.substring(7);
      if (jwtUtil.isTokenValid(token)) {
        Long tenantId = jwtUtil.extractTenantId(token);
        if (tenantId != null) {
          TenantContext.set(tenantId);
        }
      }
    }
    return true;
  }

  @Override
  public void afterCompletion(
      @Nonnull HttpServletRequest request,
      @Nonnull HttpServletResponse response,
      @Nonnull Object handler,
      Exception ex) {
    TenantContext.clear();
  }
}
