package com.trackify.common.config;

import com.trackify.common.web.CorrelationIdFilter;
import org.springframework.boot.autoconfigure.AutoConfiguration;
import org.springframework.boot.autoconfigure.condition.ConditionalOnWebApplication;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.core.Ordered;

@AutoConfiguration
@ConditionalOnWebApplication(type = ConditionalOnWebApplication.Type.SERVLET)
public class TrackifyWebAutoConfiguration {

  @Bean
  public FilterRegistrationBean<CorrelationIdFilter> correlationIdFilterRegistration() {
    FilterRegistrationBean<CorrelationIdFilter> registration = new FilterRegistrationBean<>();
    registration.setFilter(new CorrelationIdFilter());
    registration.setOrder(Ordered.HIGHEST_PRECEDENCE);
    return registration;
  }
}
