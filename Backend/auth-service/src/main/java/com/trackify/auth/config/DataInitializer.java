package com.trackify.auth.config;

import com.trackify.auth.entity.MasterUser;
import com.trackify.auth.repository.MasterUserRepository;
import com.trackify.common.enums.Role;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

  private final MasterUserRepository masterUserRepository;
  private final PasswordEncoder passwordEncoder;

  @Value("${trackify.dev.master-seed-password:}")
  private String masterSeedPassword;

  @Override
  public void run(String... args) {
    String defaultEmail = "master@trackify.com";
    if (masterUserRepository.existsByEmail(defaultEmail)) {
      log.info("Default master user already exists.");
      return;
    }

    if (!StringUtils.hasText(masterSeedPassword)) {
      log.warn(
          "Skipping default master user seed. Set trackify.dev.master-seed-password "
              + "(or TRACKIFY_DEV_MASTER_PASSWORD) to create {} on first boot.",
          defaultEmail);
      return;
    }

    log.info("Creating default master user: {}", defaultEmail);
    MasterUser master =
        MasterUser.builder()
            .email(defaultEmail)
            .password(passwordEncoder.encode(masterSeedPassword))
            .role(Role.MASTER)
            .isActive(true)
            .build();
    masterUserRepository.save(master);
  }
}
