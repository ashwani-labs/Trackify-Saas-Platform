package com.trackify.notification.service;

import com.trackify.notification.dto.EmailRequest;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

  private final JavaMailSender mailSender;

  @Value("${spring.mail.username:}")
  private String mailUsername;

  @Value("${spring.mail.password:}")
  private String mailPassword;

  @Value("${spring.mail.from:}")
  private String fromAddress;

  @PostConstruct
  void logSmtpStatusAtStartup() {
    if (isSmtpConfigured()) {
      log.info("SMTP configured for user: {} (from: {})", mailUsername, resolveFromAddress());
    } else {
      log.warn(
          "SMTP not configured. Set MAIL_USERNAME and MAIL_PASSWORD in the repo-root .env file, "
              + "then restart notification-service.");
    }
  }

  public void sendEmail(EmailRequest request) {
    if (!isSmtpConfigured()) {
      logEmailToConsole(request);
      return;
    }

    String from = resolveFromAddress();
    log.info(
        "Preparing to send email to: {} - Subject: {} (From: {})",
        request.getTo(),
        request.getSubject(),
        from);

    try {
      SimpleMailMessage message = new SimpleMailMessage();
      message.setFrom(from);
      message.setTo(request.getTo());
      message.setSubject(request.getSubject());
      message.setText(request.getBody());

      mailSender.send(message);
      log.info("Email successfully sent to: {}", request.getTo());
    } catch (Exception e) {
      log.error(
          "CRITICAL: Failed to send email to {}. Error type: {}, Message: {}",
          request.getTo(),
          e.getClass().getName(),
          e.getMessage());
      throw new IllegalStateException("Failed to send email: " + e.getMessage(), e);
    }
  }

  private boolean isSmtpConfigured() {
    return StringUtils.hasText(mailUsername) && StringUtils.hasText(mailPassword);
  }

  private String resolveFromAddress() {
    if (StringUtils.hasText(fromAddress)) {
      return fromAddress;
    }
    if (StringUtils.hasText(mailUsername)) {
      return mailUsername;
    }
    throw new IllegalStateException(
        "MAIL_FROM or MAIL_USERNAME must be set when SMTP credentials are configured");
  }

  private void logEmailToConsole(EmailRequest request) {
    log.warn(
        "SMTP not configured (set MAIL_USERNAME and MAIL_PASSWORD). Email logged to console only.");
    log.info(
        """
        ========== EMAIL (not sent) ==========
        To: {}
        Subject: {}
        --------------------------------------
        {}
        ======================================""",
        request.getTo(),
        request.getSubject(),
        request.getBody());
  }
}
