package com.trackify.auth.filter;

import com.trackify.common.security.JwtUtil;
import com.trackify.common.security.SecurityConstants;
import jakarta.annotation.Nonnull;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Collections;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
@RequiredArgsConstructor
public class JwtAuthFilter extends OncePerRequestFilter {

  private final JwtUtil jwtUtil;

  @Override
  protected void doFilterInternal(
      HttpServletRequest request,
      @Nonnull HttpServletResponse response,
      @Nonnull FilterChain filterChain)
      throws ServletException, IOException {

    final String token =
        SecurityConstants.extractBearerToken(
            request.getHeader(SecurityConstants.AUTHORIZATION_HEADER));

    if (token == null) {
      filterChain.doFilter(request, response);
      return;
    }

    if (jwtUtil.isTokenValid(token)
        && SecurityContextHolder.getContext().getAuthentication() == null) {
      String subject = jwtUtil.extractSubject(token);
      String role = jwtUtil.extractRole(token);

      UsernamePasswordAuthenticationToken authToken =
          new UsernamePasswordAuthenticationToken(
              subject, null, Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + role)));

      authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
      SecurityContextHolder.getContext().setAuthentication(authToken);
    }

    filterChain.doFilter(request, response);
  }
}
