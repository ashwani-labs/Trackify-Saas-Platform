package com.trackify.gateway.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Data
@Configuration
@ConfigurationProperties(prefix = "trackify.rate-limit")
public class RateLimitProperties {
  private boolean enabled = true;
  private int requestsPerMinute = 120;
}
