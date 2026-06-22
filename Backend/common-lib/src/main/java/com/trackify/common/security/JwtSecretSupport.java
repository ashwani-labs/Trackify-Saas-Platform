package com.trackify.common.security;

import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.io.DecodingException;
import java.nio.charset.StandardCharsets;

/** Shared JWT secret validation and local-dev default. */
public final class JwtSecretSupport {

  public static final String LOCAL_DEV_SECRET = "trackify-local-dev-jwt-secret-min-32-chars!";

  private JwtSecretSupport() {}

  public static int secretKeyByteLength(String secret) {
    if (secret == null || secret.isBlank()) {
      return 0;
    }
    try {
      return Decoders.BASE64.decode(secret).length;
    } catch (DecodingException | IllegalArgumentException ex) {
      return secret.getBytes(StandardCharsets.UTF_8).length;
    }
  }

  public static boolean isStrongEnough(String secret) {
    return secretKeyByteLength(secret) >= 32;
  }
}
