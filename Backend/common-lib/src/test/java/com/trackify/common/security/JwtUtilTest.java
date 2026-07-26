package com.trackify.common.security;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.time.Instant;
import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class JwtUtilTest {

  private JwtUtil jwtUtil;

  @BeforeEach
  void setUp() {
    JwtProperties props = new JwtProperties();
    props.setSecret(JwtSecretSupport.LOCAL_DEV_SECRET);
    props.setExpiration(3_600_000L);
    props.setIssuer("trackify");
    jwtUtil = new JwtUtil(props);
  }

  @Test
  void generateAndValidateToken_usesInstantExpiration() {
    String token = jwtUtil.generateToken("user@example.com", Map.of("role", "ADMIN"));

    assertTrue(jwtUtil.isTokenValid(token));
    assertTrue(jwtUtil.isTokenValid(token, "user@example.com"));
    Instant exp = jwtUtil.extractExpiration(token);
    assertTrue(exp.isAfter(Instant.now()));
    assertFalse(exp.isAfter(Instant.now().plusSeconds(3_700)));
  }
}
