package com.trackify.project.client;

import java.util.Map;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.MediaType;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

@Slf4j
@Component
public class NotificationEmailClient {

  private final RestTemplate restTemplate = new RestTemplate();

  @Value("${services.notification-url}")
  private String notificationUrl;

  @Async
  public void sendAssignmentEmailAsync(String toEmail, String issueTitle) {
    if (toEmail == null || toEmail.isBlank()) {
      return;
    }

    Map<String, String> request =
        Map.of(
            "to",
            toEmail,
            "subject",
            "Task Assigned: " + issueTitle,
            "body",
            "You have been assigned to: "
                + issueTitle
                + "\n\nLog in to your dashboard to view details.");

    try {
      var headers = new org.springframework.http.HttpHeaders();
      headers.setContentType(MediaType.APPLICATION_JSON);
      restTemplate.postForEntity(
          notificationUrl + "/api/notifications/email",
          new HttpEntity<>(request, headers),
          String.class);
    } catch (Exception e) {
      log.error("Failed to send assignment email to {}: {}", toEmail, e.getMessage());
    }
  }
}
