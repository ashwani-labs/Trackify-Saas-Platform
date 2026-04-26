package com.trackify.project.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Data
@Configuration
@ConfigurationProperties(prefix = "trackify.storage")
public class StorageProperties {
  /** Folder location for storing files */
  private String location = "upload-dir";
}
