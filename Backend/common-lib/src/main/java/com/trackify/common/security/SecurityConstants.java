package com.trackify.common.security;

public final class SecurityConstants {
  private SecurityConstants() {}

  public static final String AUTHORIZATION_HEADER = "Authorization";
  public static final String BEARER_PREFIX = "Bearer ";

  public static String extractBearerToken(String authorizationHeader) {
    if (authorizationHeader == null || !authorizationHeader.startsWith(BEARER_PREFIX)) {
      return null;
    }
    return authorizationHeader.substring(BEARER_PREFIX.length());
  }
}
