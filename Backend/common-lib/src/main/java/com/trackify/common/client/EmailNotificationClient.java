package com.trackify.common.client;

import java.util.Map;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

/**
 * Thin HTTP client for the notification-service email endpoint. Failures are logged and swallowed
 * so provisioning / auth flows are not blocked when email is unavailable.
 */
@Slf4j
@Component
public class EmailNotificationClient {

  private final RestTemplate restTemplate = new RestTemplate();

  @Value("${services.notification-url:http://localhost:8084}")
  private String notificationUrl;

  public void send(String to, String subject, String body) {
    if (to == null || to.isBlank()) {
      return;
    }

    HttpHeaders headers = new HttpHeaders();
    headers.setContentType(MediaType.APPLICATION_JSON);

    Map<String, String> payload =
        Map.of(
            "to", to,
            "subject", subject,
            "body", body);

    try {
      restTemplate.postForEntity(
          notificationUrl + "/api/notifications/email",
          new HttpEntity<>(payload, headers),
          String.class);
    } catch (Exception e) {
      log.error("Failed to send email to {} via {}: {}", to, notificationUrl, e.getMessage());
    }
  }
}
