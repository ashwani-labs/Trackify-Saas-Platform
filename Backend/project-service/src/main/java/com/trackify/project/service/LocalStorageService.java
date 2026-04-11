package com.trackify.project.service;

import com.trackify.common.exception.AppException;
import com.trackify.project.config.StorageProperties;
import java.io.IOException;
import java.io.InputStream;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

@Service
public class LocalStorageService implements StorageService {

  private final Path rootLocation;

  public LocalStorageService(StorageProperties properties) {
    if (properties.getLocation().trim().length() == 0) {
      throw AppException.badRequest("File upload location cannot be empty.");
    }

    this.rootLocation = Paths.get(properties.getLocation());
    try {
      Files.createDirectories(rootLocation);
    } catch (IOException e) {
      throw AppException.error("Could not initialize storage: " + e.getMessage());
    }
  }

  @Override
  public String store(MultipartFile file) {
    if (file.isEmpty()) {
      throw AppException.badRequest("Failed to store empty file.");
    }

    String originalFilename = StringUtils.cleanPath(file.getOriginalFilename());
    String extension = StringUtils.getFilenameExtension(originalFilename);
    String fileKey = UUID.randomUUID().toString();
    if (extension != null) {
      fileKey += "." + extension;
    }

    try {
      if (originalFilename.contains("..")) {
        // This is a security check
        throw AppException.badRequest("Cannot store file with relative path outside current directory " + originalFilename);
      }
      try (InputStream inputStream = file.getInputStream()) {
        Files.copy(
            inputStream,
            this.rootLocation.resolve(fileKey),
            StandardCopyOption.REPLACE_EXISTING);
      }
    } catch (IOException e) {
      throw AppException.error("Failed to store file: " + e.getMessage());
    }

    return fileKey;
  }

  @Override
  public Resource loadAsResource(String fileKey) {
    try {
      Path file = rootLocation.resolve(fileKey);
      Resource resource = new UrlResource(file.toUri());
      if (resource.exists() || resource.isReadable()) {
        return resource;
      } else {
        throw AppException.notFound("Could not read file: " + fileKey);
      }
    } catch (MalformedURLException e) {
      throw AppException.notFound("Could not read file: " + fileKey);
    }
  }

  @Override
  public void delete(String fileKey) {
    try {
      Files.deleteIfExists(this.rootLocation.resolve(fileKey));
    } catch (IOException e) {
      // Log error but don't fail business logic for cleanup
    }
  }
}
