package com.trackify.common.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ErrorResponse {

  private int status;
  private String error;
  private String message;
  private String path;

  @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
  private LocalDateTime timestamp;

  public static ErrorResponse of(int status, String error, String message, String path) {
    return ErrorResponse.builder()
        .status(status)
        .error(error)
        .message(message)
        .path(path)
        .timestamp(LocalDateTime.now(ZoneOffset.UTC))
        .build();
  }
}
