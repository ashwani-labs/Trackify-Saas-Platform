package com.trackify.common.security;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Data
@Component
@ConfigurationProperties(prefix = "jwt")
public class JwtProperties {

    /** Base64-encoded 256-bit secret — set via JWT_SECRET environment variable */
    private String secret;

    /** Token validity in milliseconds. Default: 24 hours */
    private long expiration = 86_400_000L;

    /** Token issuer claim */
    private String issuer = "trackify-platform";
}
