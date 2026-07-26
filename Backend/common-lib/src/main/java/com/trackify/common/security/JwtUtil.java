package com.trackify.common.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.io.DecodingException;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;
import javax.crypto.SecretKey;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class JwtUtil {

  private final JwtProperties jwtProperties;

  public JwtUtil(JwtProperties jwtProperties) {
    this.jwtProperties = jwtProperties;
  }

  private SecretKey getSigningKey() {
    return Keys.hmacShaKeyFor(resolveSecretKeyBytes(jwtProperties.getSecret()));
  }

  /**
   * Accepts either a Base64-encoded key (from {@code openssl rand -base64 32}) or a plain-text
   * secret of at least 32 characters for local development.
   */
  static byte[] resolveSecretKeyBytes(String secret) {
    if (secret == null || secret.isBlank()) {
      throw new IllegalArgumentException(
          "JWT_SECRET is not set. Copy .env.example to .env in the repo root "
              + "or set JWT_SECRET in your IDE run configuration (min 32 characters).");
    }
    if (!JwtSecretSupport.isStrongEnough(secret)) {
      int bits = JwtSecretSupport.secretKeyByteLength(secret) * 8;
      throw new IllegalArgumentException(
          "JWT_SECRET must be at least 32 bytes for HS256 (plain text: 32+ characters, "
              + "or use: openssl rand -base64 32). Current key is "
              + bits
              + " bits. Remove the short JWT_SECRET from your IDE run configuration.");
    }
    try {
      return Decoders.BASE64.decode(secret);
    } catch (DecodingException | IllegalArgumentException ex) {
      return secret.getBytes(StandardCharsets.UTF_8);
    }
  }

  public String generateToken(String subject, Map<String, Object> extraClaims) {
    Instant now = Instant.now();
    Instant expiresAt = now.plusMillis(jwtProperties.getExpiration());
    // Use NumericDate (epoch seconds) so we stay on java.time; JJWT builder Date helpers are
    // legacy-only in 0.12.x.
    return Jwts.builder()
        .claims(extraClaims)
        .subject(subject)
        .issuer(jwtProperties.getIssuer())
        .claim(Claims.ISSUED_AT, now.getEpochSecond())
        .claim(Claims.EXPIRATION, expiresAt.getEpochSecond())
        .signWith(getSigningKey())
        .compact();
  }

  public String generateToken(String subject, String role) {
    Map<String, Object> claims = new HashMap<>();
    claims.put("role", role);
    return generateToken(subject, claims);
  }

  public String generateToken(String subject, String role, Long tenantId, Long userId) {
    Map<String, Object> claims = new HashMap<>();
    claims.put("role", role);
    if (tenantId != null) claims.put("tenantId", tenantId);
    if (userId != null) claims.put("userId", userId);
    return generateToken(subject, claims);
  }

  public boolean isTokenValid(String token) {
    try {
      parseClaims(token);
      return true;
    } catch (JwtException | IllegalArgumentException e) {
      log.warn("Invalid JWT token: {}", e.getMessage());
      return false;
    }
  }

  public boolean isTokenValid(String token, String expectedSubject) {
    try {
      String subject = extractSubject(token);
      return subject.equals(expectedSubject) && !isTokenExpired(token);
    } catch (JwtException e) {
      return false;
    }
  }

  public String extractSubject(String token) {
    return extractClaim(token, Claims::getSubject);
  }

  public String extractEmail(String token) {
    return extractSubject(token);
  }

  public String extractRole(String token) {
    return extractClaim(token, claims -> claims.get("role", String.class));
  }

  public Long extractTenantId(String token) {
    return extractClaim(
        token,
        claims -> {
          Object v = claims.get("tenantId");
          if (v instanceof Integer i) return i.longValue();
          if (v instanceof Long l) return l;
          return null;
        });
  }

  public Long extractUserId(String token) {
    return extractClaim(
        token,
        claims -> {
          Object v = claims.get("userId");
          if (v instanceof Integer i) return i.longValue();
          if (v instanceof Long l) return l;
          return null;
        });
  }

  public Instant extractExpiration(String token) {
    return extractClaim(token, JwtUtil::readExpiration);
  }

  public <T> T extractClaim(String token, Function<Claims, T> resolver) {
    return resolver.apply(parseClaims(token));
  }

  private boolean isTokenExpired(String token) {
    return extractExpiration(token).isBefore(Instant.now());
  }

  private Claims parseClaims(String token) {
    return Jwts.parser().verifyWith(getSigningKey()).build().parseSignedClaims(token).getPayload();
  }

  /** Reads JWT NumericDate {@code exp} as epoch seconds (java.time only). */
  private static Instant readExpiration(Claims claims) {
    Object exp = claims.get(Claims.EXPIRATION);
    if (exp instanceof Number number) {
      return Instant.ofEpochSecond(number.longValue());
    }
    throw new IllegalArgumentException(
        "JWT missing or invalid exp claim: " + (exp == null ? "null" : exp.getClass().getName()));
  }
}
