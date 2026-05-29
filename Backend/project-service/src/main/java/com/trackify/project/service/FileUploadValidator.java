package com.trackify.project.service;

import com.trackify.common.exception.AppException;
import com.trackify.project.config.StorageProperties;
import java.util.Locale;
import java.util.Set;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

@Component
public class FileUploadValidator {

  private static final Set<String> ALLOWED_CONTENT_TYPES =
      Set.of(
          "image/jpeg",
          "image/png",
          "image/gif",
          "image/webp",
          "application/pdf",
          "text/plain",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document");

  private static final Set<String> BLOCKED_EXTENSIONS =
      Set.of("exe", "bat", "cmd", "sh", "js", "jar", "msi", "dll", "com", "scr");

  private final StorageProperties properties;

  public FileUploadValidator(StorageProperties properties) {
    this.properties = properties;
  }

  public void validate(MultipartFile file) {
    if (file == null || file.isEmpty()) {
      throw AppException.badRequest("File is required.");
    }

    if (file.getSize() > properties.getMaxFileSizeBytes()) {
      throw AppException.badRequest(
          "File exceeds maximum size of "
              + (properties.getMaxFileSizeBytes() / (1024 * 1024))
              + " MB.");
    }

    String extension =
        StringUtils.getFilenameExtension(StringUtils.cleanPath(file.getOriginalFilename()));
    if (extension != null && BLOCKED_EXTENSIONS.contains(extension.toLowerCase(Locale.ROOT))) {
      throw AppException.badRequest("File type is not allowed.");
    }

    String contentType = file.getContentType();
    if (contentType != null
        && !contentType.isBlank()
        && !ALLOWED_CONTENT_TYPES.contains(contentType.toLowerCase(Locale.ROOT))) {
      throw AppException.badRequest("Unsupported content type: " + contentType);
    }
  }
}
