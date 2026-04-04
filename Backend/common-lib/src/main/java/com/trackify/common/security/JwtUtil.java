package com.trackify.common.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import java.util.Date;
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
    byte[] keyBytes = Decoders.BASE64.decode(jwtProperties.getSecret());
    return Keys.hmacShaKeyFor(keyBytes);
  }

  public String generateToken(String subject, Map<String, Object> extraClaims) {
    return Jwts.builder()
        .claims(extraClaims)
        .subject(subject)
        .issuer(jwtProperties.getIssuer())
        .issuedAt(new Date())
        .expiration(new Date(System.currentTimeMillis() + jwtProperties.getExpiration()))
        .signWith(getSigningKey())
        .compact();
  }

  public String generateToken(String subject, String role) {
    Map<String, Object> claims = new HashMap<>();
    claims.put("role", role);
    return generateToken(subject, claims);
  }

  public String generateToken(String subject, String role, Long tenantId) {
    Map<String, Object> claims = new HashMap<>();
    claims.put("role", role);
    if (tenantId != null) claims.put("tenantId", tenantId);
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

  public Date extractExpiration(String token) {
    return extractClaim(token, Claims::getExpiration);
  }

  public <T> T extractClaim(String token, Function<Claims, T> resolver) {
    return resolver.apply(parseClaims(token));
  }

  private boolean isTokenExpired(String token) {
    return extractExpiration(token).before(new Date());
  }

  private Claims parseClaims(String token) {
    return Jwts.parser().verifyWith(getSigningKey()).build().parseSignedClaims(token).getPayload();
  }
}
