package com.trackify.notification.service;

import com.trackify.notification.dto.EmailRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    public void sendEmail(EmailRequest request) {
        log.info("Preparing to send email to: {} - Subject: {}", request.getTo(), request.getSubject());
        
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("noreply@trackify.com");
            message.setTo(request.getTo());
            message.setSubject(request.getSubject());
            message.setText(request.getBody());
            
            mailSender.send(message);
            log.info("Email successfully sent to: {}", request.getTo());
        } catch (Exception e) {
            log.error("Failed to send email to {}. If running locally without MailHog, this is expected. Error: {}", 
                     request.getTo(), e.getMessage());
            // We swallow the exception to not crash requests in development environment
            // In production, we'd want a retry queue or proper handling
        }
    }
}
