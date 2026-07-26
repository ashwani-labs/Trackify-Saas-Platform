package com.trackify.project.client;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;

import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

class NotificationEmailClientTest {

  @Test
  void sendAssignmentEmailAsync_skipsBlankEmail() {
    NotificationEmailClient client = new NotificationEmailClient();
    assertDoesNotThrow(() -> client.sendAssignmentEmailAsync("  ", "Issue"));
  }

  @Test
  void sendAssignmentEmailAsync_handlesUnreachableNotificationService() {
    NotificationEmailClient client = new NotificationEmailClient();
    ReflectionTestUtils.setField(client, "notificationUrl", "http://localhost:1");
    assertDoesNotThrow(() -> client.sendAssignmentEmailAsync("dev@example.com", "Fix login"));
  }
}
