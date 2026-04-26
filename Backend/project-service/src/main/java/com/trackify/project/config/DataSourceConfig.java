package com.trackify.project.config;

import com.zaxxer.hikari.HikariDataSource;
import java.util.HashMap;
import java.util.Map;
import javax.sql.DataSource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Lazy;
import org.springframework.context.annotation.Primary;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/** Configure the multi-tenant datasource routing engine. */
@Configuration
public class DataSourceConfig implements WebMvcConfigurer {

  private static final Logger log = LoggerFactory.getLogger(DataSourceConfig.class);

  private final TenantInterceptor tenantInterceptor;

  @Value(
      "${spring.datasource.url:jdbc:mysql://localhost:3306/trackify_master?useSSL=false&allowPublicKeyRetrieval=true}")
  private String masterUrl;

  @Value("${spring.datasource.username:root}")
  private String masterUser;

  @Value("${spring.datasource.password:root}")
  private String masterPass;

  public DataSourceConfig(TenantInterceptor tenantInterceptor) {
    this.tenantInterceptor = tenantInterceptor;
  }

  /** 1. Register the Tenant Interceptor to detect the tenant_id from JWT. */
  @Override
  public void addInterceptors(InterceptorRegistry registry) {
    registry.addInterceptor(tenantInterceptor);
  }

  /** 2. The Master DataSource — used to fetch the tenant registry. */
  @Bean(name = "masterDataSource")
  public DataSource masterDataSource() {
    HikariDataSource ds = new HikariDataSource();
    ds.setJdbcUrl(masterUrl);
    ds.setUsername(masterUser);
    ds.setPassword(masterPass);
    ds.setDriverClassName("com.mysql.cj.jdbc.Driver");
    ds.setPoolName("MasterPool");
    return ds;
  }

  @Bean(name = "masterJdbcTemplate")
  public JdbcTemplate masterJdbcTemplate(@Qualifier("masterDataSource") DataSource ds) {
    return new JdbcTemplate(ds);
  }

  /** 3. The Dynamic Routing DataSource (The Primary DataSource). */
  @Bean
  @Primary
  public DataSource dataSource(
      @Lazy @Qualifier("masterJdbcTemplate") JdbcTemplate masterJdbcTemplate,
      @Qualifier("masterDataSource") DataSource masterDataSource) {
    TenantRoutingDataSource routingDataSource =
        new TenantRoutingDataSource() {
          @Override
          protected Object determineCurrentLookupKey() {
            Long tenantId = TenantContext.get();
            if (tenantId != null && !this.hasTenant(tenantId)) {
              initializeTenantDataSource(tenantId, masterJdbcTemplate, this);
            }
            return tenantId;
          }
        };

    routingDataSource.setDefaultTargetDataSource(masterDataSource);
    routingDataSource.setTargetDataSources(new HashMap<>());
    routingDataSource.afterPropertiesSet();
    return routingDataSource;
  }

  private synchronized void initializeTenantDataSource(
      Long tenantId, JdbcTemplate masterJdbcTemplate, TenantRoutingDataSource routingDataSource) {
    if (routingDataSource.hasTenant(tenantId)) return;

    log.info("Provisioning connection pool for tenant_id: {}", tenantId);

    try {
      Map<String, Object> tenant =
          masterJdbcTemplate.queryForMap(
              "SELECT db_name, db_host, db_port, db_username, db_password FROM tenants WHERE id = ?",
              tenantId);

      String dbName = (String) tenant.get("db_name");
      String host = (String) tenant.get("db_host");
      Integer port = (Integer) tenant.get("db_port");
      String username = (String) tenant.get("db_username");
      String password = (String) tenant.get("db_password");

      String url =
          String.format(
              "jdbc:mysql://%s:%d/%s?useSSL=false&allowPublicKeyRetrieval=true",
              host, port, dbName);

      HikariDataSource ds = new HikariDataSource();
      ds.setJdbcUrl(url);
      ds.setUsername(username);
      ds.setPassword(password);
      ds.setDriverClassName("com.mysql.cj.jdbc.Driver");
      ds.setPoolName("TenantPool-" + tenantId);
      ds.setMaximumPoolSize(5);

      routingDataSource.registerTenantDataSource(tenantId, ds);

      log.info("Successfully added tenant database: {}", dbName);
    } catch (Exception e) {
      log.error("Failed to initialize DataSource for tenant {}: {}", tenantId, e.getMessage());
    }
  }
}
