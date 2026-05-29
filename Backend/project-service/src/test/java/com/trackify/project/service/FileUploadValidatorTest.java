package com.trackify.project.service;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;

import com.trackify.common.exception.AppException;
import com.trackify.project.config.StorageProperties;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockMultipartFile;

class FileUploadValidatorTest {

  private FileUploadValidator validator;

  @BeforeEach
  void setUp() {
    StorageProperties properties = new StorageProperties();
    properties.setMaxFileSizeBytes(1024);
    validator = new FileUploadValidator(properties);
  }

  @Test
  void validate_rejectsEmptyFile() {
    MockMultipartFile file = new MockMultipartFile("file", "doc.pdf", "application/pdf", new byte[0]);
    assertThrows(AppException.class, () -> validator.validate(file));
  }

  @Test
  void validate_rejectsOversizedFile() {
    MockMultipartFile file =
        new MockMultipartFile("file", "doc.pdf", "application/pdf", new byte[2048]);
    assertThrows(AppException.class, () -> validator.validate(file));
  }

  @Test
  void validate_rejectsBlockedExtension() {
    MockMultipartFile file =
        new MockMultipartFile("file", "malware.exe", "application/octet-stream", new byte[10]);
    assertThrows(AppException.class, () -> validator.validate(file));
  }

  @Test
  void validate_acceptsAllowedPdf() {
    MockMultipartFile file =
        new MockMultipartFile("file", "spec.pdf", "application/pdf", new byte[100]);
    assertDoesNotThrow(() -> validator.validate(file));
  }
}
