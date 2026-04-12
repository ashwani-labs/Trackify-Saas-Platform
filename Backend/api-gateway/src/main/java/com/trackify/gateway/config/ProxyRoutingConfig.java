package com.trackify.gateway.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.HttpComponentsClientHttpRequestFactory;
import org.springframework.web.client.RestTemplate;

@Slf4j
@Configuration
public class ProxyRoutingConfig {

  public ProxyRoutingConfig() {
    log.info("Initialized ProxyRoutingConfig with RestTemplate support for PATCH");
  }

  @Bean
  public RestTemplate restTemplate() {
    HttpComponentsClientHttpRequestFactory factory = new HttpComponentsClientHttpRequestFactory();
    return new RestTemplate(factory);
  }
}
