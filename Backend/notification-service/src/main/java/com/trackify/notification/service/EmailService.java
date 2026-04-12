package com.trackify.notification.service;

import com.trackify.notification.dto.EmailRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    public void sendEmail(EmailRequest request) {
        log.info("Preparing to send email to: {} - Subject: {} (From: {})", request.getTo(), request.getSubject(), fromEmail);
        
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(request.getTo());
            message.setSubject(request.getSubject());
            message.setText(request.getBody());
            
            mailSender.send(message);
            log.info("Email successfully sent to: {}", request.getTo());
        } catch (Exception e) {
            log.error("CRITICAL: Failed to send email to {}. Error type: {}, Message: {}", 
                     request.getTo(), e.getClass().getName(), e.getMessage());
            e.printStackTrace();
        }
    }
}
