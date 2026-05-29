package com.trackify.project.service;

import com.trackify.common.exception.AppException;
import com.trackify.project.config.StorageProperties;
import java.io.IOException;
import java.io.InputStream;
import java.net.URI;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

@Slf4j
public class LocalStorageService implements StorageService {

  private final Path rootLocation;

  public LocalStorageService(StorageProperties properties) {
    if (properties.getLocation().trim().isEmpty()) {
      throw AppException.badRequest("File upload location cannot be empty.");
    }

    this.rootLocation = Paths.get(properties.getLocation());
    try {
      Files.createDirectories(rootLocation);
    } catch (IOException e) {
      throw AppException.internalError("Could not initialize storage: " + e.getMessage());
    }
  }

  @Override
  public String store(MultipartFile file) {
    String originalFilename = StringUtils.cleanPath(file.getOriginalFilename());
    String extension = StringUtils.getFilenameExtension(originalFilename);
    String fileKey = UUID.randomUUID().toString();
    if (extension != null) {
      fileKey += "." + extension;
    }

    try {
      if (originalFilename.contains("..")) {
        throw AppException.badRequest(
            "Cannot store file with relative path outside current directory "
                + originalFilename);
      }
      try (InputStream inputStream = file.getInputStream()) {
        Files.copy(
            inputStream, this.rootLocation.resolve(fileKey), StandardCopyOption.REPLACE_EXISTING);
      }
    } catch (IOException e) {
      throw AppException.internalError("Failed to store file: " + e.getMessage());
    }

    return fileKey;
  }

  @Override
  public Resource loadAsResource(String fileKey) {
    try {
      Path file = rootLocation.resolve(fileKey);
      if (!Files.exists(file) || !Files.isReadable(file)) {
        throw AppException.notFound("Could not read file: " + fileKey);
      }
      return new InputStreamResource(Files.newInputStream(file));
    } catch (IOException e) {
      throw AppException.notFound("Could not read file: " + fileKey);
    }
  }

  @Override
  public void delete(String fileKey) {
    try {
      Files.deleteIfExists(this.rootLocation.resolve(fileKey));
    } catch (IOException e) {
      log.warn("Failed to delete local file {}: {}", fileKey, e.getMessage());
    }
  }
}
