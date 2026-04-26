package com.trackify.project.config;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import javax.sql.DataSource;
import org.springframework.jdbc.datasource.lookup.AbstractRoutingDataSource;

/**
 * Custom RoutingDataSource to select the correct tenant-specific DataSource. It uses the 'tenantId'
 * stored in the TenantContext and allows dynamic registration.
 */
public class TenantRoutingDataSource extends AbstractRoutingDataSource {

  private final Map<Object, Object> targetDataSources = new ConcurrentHashMap<>();

  @Override
  protected Object determineCurrentLookupKey() {
    return TenantContext.get();
  }

  public synchronized void registerTenantDataSource(Long tenantId, DataSource dataSource) {
    targetDataSources.put(tenantId, dataSource);
    setTargetDataSources(targetDataSources);
    afterPropertiesSet(); // Re-initialize the internal lookup map
  }

  public boolean hasTenant(Long tenantId) {
    return targetDataSources.containsKey(tenantId);
  }
}
