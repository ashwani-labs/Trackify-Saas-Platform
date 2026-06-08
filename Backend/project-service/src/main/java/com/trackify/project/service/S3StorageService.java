package com.trackify.project.service;

import com.trackify.common.exception.AppException;
import com.trackify.project.config.StorageProperties;
import java.io.IOException;
import java.net.URI;
import java.util.UUID;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.S3ClientBuilder;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.NoSuchKeyException;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

@Slf4j
public class S3StorageService implements StorageService {

  private final StorageProperties properties;
  private final S3Client s3Client;

  public S3StorageService(StorageProperties properties) {
    this.properties = properties;
    StorageProperties.S3 s3 = properties.getS3();
    if (s3.getBucket() == null || s3.getBucket().isBlank()) {
      throw AppException.internalError("S3 bucket is required when trackify.storage.provider=s3");
    }

    S3ClientBuilder builder =
        S3Client.builder()
            .region(Region.of(s3.getRegion()))
            .credentialsProvider(
                StaticCredentialsProvider.create(
                    AwsBasicCredentials.create(s3.getAccessKey(), s3.getSecretKey())));

    if (s3.getEndpoint() != null && !s3.getEndpoint().isBlank()) {
      builder.endpointOverride(URI.create(s3.getEndpoint())).forcePathStyle(true);
    }

    this.s3Client = builder.build();
  }

  @Override
  public String store(MultipartFile file) {
    String originalFilename = StringUtils.cleanPath(file.getOriginalFilename());
    String extension = StringUtils.getFilenameExtension(originalFilename);
    String fileKey = UUID.randomUUID().toString();
    if (extension != null) {
      fileKey += "." + extension;
    }

    String objectKey = buildObjectKey(fileKey);
    try {
      PutObjectRequest request =
          PutObjectRequest.builder()
              .bucket(properties.getS3().getBucket())
              .key(objectKey)
              .contentType(file.getContentType())
              .contentLength(file.getSize())
              .build();
      s3Client.putObject(
          request, RequestBody.fromInputStream(file.getInputStream(), file.getSize()));
    } catch (IOException e) {
      throw AppException.internalError("Failed to upload file to S3: " + e.getMessage());
    }

    return fileKey;
  }

  @Override
  public Resource loadAsResource(String fileKey) {
    try {
      var response =
          s3Client.getObject(
              GetObjectRequest.builder()
                  .bucket(properties.getS3().getBucket())
                  .key(buildObjectKey(fileKey))
                  .build());
      return new InputStreamResource(response);
    } catch (NoSuchKeyException e) {
      throw AppException.notFound("Could not read file: " + fileKey);
    }
  }

  @Override
  public void delete(String fileKey) {
    try {
      s3Client.deleteObject(
          DeleteObjectRequest.builder()
              .bucket(properties.getS3().getBucket())
              .key(buildObjectKey(fileKey))
              .build());
    } catch (Exception e) {
      log.warn("Failed to delete S3 object {}: {}", fileKey, e.getMessage());
    }
  }

  private String buildObjectKey(String fileKey) {
    String prefix = properties.getS3().getKeyPrefix();
    if (prefix == null || prefix.isBlank()) {
      return fileKey;
    }
    return prefix.replaceAll("/+$", "") + "/" + fileKey;
  }
}
