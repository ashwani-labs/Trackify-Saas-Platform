package com.trackify.auth.config;

import com.trackify.auth.entity.MasterUser;
import com.trackify.auth.repository.MasterUserRepository;
import com.trackify.common.enums.Role;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

  private final MasterUserRepository masterUserRepository;
  private final PasswordEncoder passwordEncoder;

  @Override
  public void run(String... args) throws Exception {
    String defaultEmail = "master@trackify.com";
    if (!masterUserRepository.existsByEmail(defaultEmail)) {
      log.info("Creating default master user: {}", defaultEmail);
      MasterUser master =
          MasterUser.builder()
              .email(defaultEmail)
              .password(passwordEncoder.encode("admin123"))
              .role(Role.MASTER)
              .isActive(true)
              .build();
      masterUserRepository.save(master);
    } else {
      log.info("Default master user already exists.");
    }
  }
}
