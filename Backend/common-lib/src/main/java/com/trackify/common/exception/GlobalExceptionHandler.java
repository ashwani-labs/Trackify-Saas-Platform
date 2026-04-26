package com.trackify.common.exception;

import com.trackify.common.dto.ErrorResponse;
import jakarta.servlet.http.HttpServletRequest;
import java.util.stream.Collectors;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.validation.FieldError;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

  @ExceptionHandler(AppException.class)
  public ResponseEntity<ErrorResponse> handleAppException(AppException ex, HttpServletRequest req) {
    log.warn("AppException [{}]: {}", ex.getStatus(), ex.getMessage());
    return ResponseEntity.status(ex.getStatus())
        .body(
            ErrorResponse.of(
                ex.getStatus().value(),
                ex.getStatus().getReasonPhrase(),
                ex.getMessage(),
                req.getRequestURI()));
  }

  @ExceptionHandler(MethodArgumentNotValidException.class)
  public ResponseEntity<ErrorResponse> handleValidationException(
      MethodArgumentNotValidException ex, HttpServletRequest req) {

    String message =
        ex.getBindingResult().getFieldErrors().stream()
            .map(FieldError::getDefaultMessage)
            .collect(Collectors.joining(", "));

    return ResponseEntity.status(HttpStatus.BAD_REQUEST)
        .body(ErrorResponse.of(400, "Validation Failed", message, req.getRequestURI()));
  }

  @ExceptionHandler(BadCredentialsException.class)
  public ResponseEntity<ErrorResponse> handleBadCredentials(
      BadCredentialsException ex, HttpServletRequest req) {
    return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
        .body(
            ErrorResponse.of(
                401, "Unauthorized", "Invalid email or password", req.getRequestURI()));
  }

  @ExceptionHandler(AccessDeniedException.class)
  public ResponseEntity<ErrorResponse> handleAccessDenied(
      AccessDeniedException ex, HttpServletRequest req) {
    return ResponseEntity.status(HttpStatus.FORBIDDEN)
        .body(
            ErrorResponse.of(
                403,
                "Forbidden",
                "You do not have permission to access this resource",
                req.getRequestURI()));
  }

  @ExceptionHandler(MaxUploadSizeExceededException.class)
  public ResponseEntity<ErrorResponse> handleMaxSizeException(
      MaxUploadSizeExceededException exc, HttpServletRequest req) {
    return ResponseEntity.status(HttpStatus.PAYLOAD_TOO_LARGE)
        .body(
            ErrorResponse.of(
                413, "Payload Too Large", "File size exceeds the limit!", req.getRequestURI()));
  }

  @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
  public ResponseEntity<ErrorResponse> handleMethodNotSupported(
      HttpRequestMethodNotSupportedException ex, HttpServletRequest req) {
    return ResponseEntity.status(HttpStatus.METHOD_NOT_ALLOWED)
        .body(ErrorResponse.of(405, "Method Not Allowed", ex.getMessage(), req.getRequestURI()));
  }

  @ExceptionHandler(Exception.class)
  public ResponseEntity<ErrorResponse> handleGeneral(Exception ex, HttpServletRequest req) {
    log.error("Unhandled exception at {}: {}", req.getRequestURI(), ex.getMessage(), ex);
    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
        .body(
            ErrorResponse.of(
                500, "Internal Server Error", "An unexpected error occurred", req.getRequestURI()));
  }
}
