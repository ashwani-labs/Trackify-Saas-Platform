package com.trackify.project.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Data
@Configuration
@ConfigurationProperties(prefix = "trackify.storage")
public class StorageProperties {

  /** Storage backend: local (default) or s3 */
  private String provider = "local";

  /** Local folder location when provider=local */
  private String location = "upload-dir";

  /** Maximum upload size in bytes (default 10 MB) */
  private long maxFileSizeBytes = 10 * 1024 * 1024;

  private S3 s3 = new S3();

  @Data
  public static class S3 {
    private String bucket;
    private String region = "us-east-1";
    /** Optional custom endpoint for MinIO or LocalStack */
    private String endpoint;
    private String accessKey;
    private String secretKey;
    private String keyPrefix = "attachments";
  }
}
