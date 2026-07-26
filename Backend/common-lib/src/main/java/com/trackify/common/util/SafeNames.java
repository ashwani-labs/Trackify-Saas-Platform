package com.trackify.common.util;

import com.trackify.common.exception.AppException;
import java.util.regex.Pattern;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

/** Shared helpers for validated identifiers and upload filenames. */
public final class SafeNames {

  private static final Pattern MYSQL_IDENTIFIER = Pattern.compile("^\\w+$");

  private SafeNames() {}

  public static String requireMysqlIdentifier(String value, String label) {
    if (value == null || !MYSQL_IDENTIFIER.matcher(value).matches()) {
      throw AppException.internalError("Invalid " + label);
    }
    return value;
  }

  /** Escapes a string for use inside a single-quoted MySQL literal. */
  public static String quoteMysqlLiteral(String value) {
    if (value == null) {
      throw AppException.internalError("Missing SQL literal value");
    }
    return "'" + value.replace("\\", "\\\\").replace("'", "''") + "'";
  }

  public static String cleanOriginalFilename(MultipartFile file) {
    String filename = file.getOriginalFilename();
    if (filename == null || filename.isBlank()) {
      throw AppException.badRequest("File name is required.");
    }
    return StringUtils.cleanPath(filename);
  }
}
