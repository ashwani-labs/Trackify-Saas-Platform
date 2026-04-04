package com.trackify.gateway.controller;

import jakarta.servlet.http.HttpServletRequest;
import java.net.URI;
import java.util.Enumeration;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestBody;
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
  public ResponseEntity<String> proxyRequest(
      HttpServletRequest request, @RequestBody(required = false) String body, HttpMethod method) {
    String path = request.getRequestURI();
    String queryParams = request.getQueryString() != null ? "?" + request.getQueryString() : "";
    String targetBaseUrl;

    if (path.startsWith("/auth")) {
      targetBaseUrl = authUrl;
    } else if (path.startsWith("/tenants")) {
      targetBaseUrl = tenantUrl;
    } else if (path.startsWith("/projects") || path.startsWith("/issues")) {
      targetBaseUrl = projectUrl;
    } else {
      return ResponseEntity.notFound().build();
    }

    String targetUrl = targetBaseUrl + path + queryParams;

    HttpHeaders headers = new HttpHeaders();
    Enumeration<String> headerNames = request.getHeaderNames();
    while (headerNames.hasMoreElements()) {
      String headerName = headerNames.nextElement();
      headers.add(headerName, request.getHeader(headerName));
    }

    HttpEntity<String> entity = new HttpEntity<>(body, headers);

    try {
      log.info("Proxying request: {} {}", method, targetUrl);
      return restTemplate.exchange(URI.create(targetUrl), method, entity, String.class);
    } catch (HttpClientErrorException | HttpServerErrorException e) {
      return ResponseEntity.status(e.getStatusCode())
          .headers(e.getResponseHeaders())
          .body(e.getResponseBodyAsString());
    } catch (Exception e) {
      log.error("Proxy error", e);
      return ResponseEntity.internalServerError()
          .body("{\"success\":false,\"message\":\"Internal Gateway Error\"}");
    }
  }
}
