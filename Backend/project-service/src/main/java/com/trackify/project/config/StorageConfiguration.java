package com.trackify.project.config;

import com.trackify.project.service.LocalStorageService;
import com.trackify.project.service.S3StorageService;
import com.trackify.project.service.StorageService;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableConfigurationProperties(StorageProperties.class)
public class StorageConfiguration {

  @Bean
  @ConditionalOnProperty(name = "trackify.storage.provider", havingValue = "s3")
  public StorageService s3StorageService(StorageProperties properties) {
    return new S3StorageService(properties);
  }

  @Bean
  @ConditionalOnProperty(
      name = "trackify.storage.provider",
      havingValue = "local",
      matchIfMissing = true)
  public StorageService localStorageService(StorageProperties properties) {
    return new LocalStorageService(properties);
  }
}
