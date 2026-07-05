package com.trackify.gateway.controller;

import com.trackify.common.web.CorrelationIdFilter;
import jakarta.servlet.http.HttpServletRequest;
import java.net.URI;
import java.util.Enumeration;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.MDC;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.RestTemplate;

@Slf4j
@RestController
@RequiredArgsConstructor
public class GatewayController {

  private final RestTemplate restTemplate;

  @Value("${services.auth-url}")
  private String authUrl;

  @Value("${services.tenant-url}")
  private String tenantUrl;

  @Value("${services.project-url}")
  private String projectUrl;

  @RequestMapping("/**")
  public ResponseEntity<byte[]> proxyRequest(HttpServletRequest request, HttpMethod method) {
    String path = request.getRequestURI();
    String queryParams = request.getQueryString() != null ? "?" + request.getQueryString() : "";
    String targetBaseUrl;

    if (path.startsWith("/auth")) {
      targetBaseUrl = authUrl;
    } else if (path.startsWith("/tenants")) {
      targetBaseUrl = tenantUrl;
    } else if (path.startsWith("/internal")) {
      targetBaseUrl = projectUrl;
    } else if (path.startsWith("/projects")
        || path.startsWith("/issues")
        || path.startsWith("/activity")
        || path.startsWith("/search")
        || path.startsWith("/notifications")
        || path.startsWith("/dashboard")) {
      targetBaseUrl = projectUrl;
    } else {
      return ResponseEntity.notFound().build();
    }

    String targetUrl = targetBaseUrl + path + queryParams;

    HttpHeaders headers = new HttpHeaders();
    String correlationId = request.getHeader(CorrelationIdFilter.HEADER);
    if (correlationId == null || correlationId.isBlank()) {
      correlationId = MDC.get(CorrelationIdFilter.MDC_KEY);
    }
    if (correlationId != null && !correlationId.isBlank()) {
      headers.add(CorrelationIdFilter.HEADER, correlationId);
    }

    Enumeration<String> headerNames = request.getHeaderNames();
    while (headerNames.hasMoreElements()) {
      String headerName = headerNames.nextElement();
      if (shouldSkipRequestHeader(headerName)) {
        continue;
      }
      Enumeration<String> values = request.getHeaders(headerName);
      while (values.hasMoreElements()) {
        headers.add(headerName, values.nextElement());
      }
    }

    byte[] bodyBytes = null;
    if (request.getContentLengthLong() > 0
        || "chunked".equalsIgnoreCase(request.getHeader("Transfer-Encoding"))) {
      try {
        bodyBytes = request.getInputStream().readAllBytes();
      } catch (Exception e) {
        log.error("Failed to read request body: {}", e.getMessage());
      }
    }

    HttpEntity<byte[]> entity = new HttpEntity<>(bodyBytes, headers);

    try {
      log.info(
          "Proxying request: {} {} correlationId={}",
          method,
          targetUrl,
          correlationId != null ? correlationId : "n/a");
      return restTemplate.exchange(URI.create(targetUrl), method, entity, byte[].class);
    } catch (HttpClientErrorException | HttpServerErrorException e) {
      return ResponseEntity.status(e.getStatusCode())
          .headers(e.getResponseHeaders())
          .body(e.getResponseBodyAsByteArray());
    } catch (Exception e) {
      log.error("Proxy error: {}", e.getMessage(), e);
      String errorJson =
          String.format(
              "{\"success\":false,\"message\":\"Internal Gateway Error: %s\"}", e.getMessage());
      return ResponseEntity.internalServerError()
          .header("Content-Type", "application/json")
          .body(errorJson.getBytes());
    }
  }

  private boolean shouldSkipRequestHeader(String headerName) {
    return headerName.equalsIgnoreCase("Content-Length") || headerName.equalsIgnoreCase("Host");
  }
}
