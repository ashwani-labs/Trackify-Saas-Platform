package com.trackify.tenant.client;

import java.util.Map;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

@Slf4j
@Component
public class ProjectNotificationClient {

  private final RestTemplate restTemplate = new RestTemplate();

  @Value("${services.project-url:http://localhost:8083}")
  private String projectUrl;

  @Value("${trackify.internal-api-key:}")
  private String internalApiKey;

  public void notifyUserApprovalPending(
      Long tenantId, Long pendingUserId, String email, String fullName) {
    if (internalApiKey == null || internalApiKey.isBlank()) {
      log.warn("trackify.internal-api-key not set; skipping user approval notifications");
      return;
    }

    HttpHeaders headers = new HttpHeaders();
    headers.setContentType(MediaType.APPLICATION_JSON);
    headers.set("X-Tenant-Id", String.valueOf(tenantId));
    headers.set("X-Internal-Api-Key", internalApiKey);

    Map<String, Object> body =
        Map.of(
            "pendingUserId", pendingUserId,
            "email", email,
            "fullName", fullName != null ? fullName : "");

    try {
      restTemplate.postForEntity(
          projectUrl + "/internal/notifications/user-approval",
          new HttpEntity<>(body, headers),
          Void.class);
    } catch (Exception e) {
      log.error("Failed to notify admins of pending user: {}", e.getMessage());
    }
  }
}
