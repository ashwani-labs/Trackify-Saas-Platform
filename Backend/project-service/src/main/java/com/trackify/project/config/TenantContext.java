package com.trackify.project.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * ThreadLocal wrapper for storing the current tenant_id.
 * Used by the RoutingDataSource to switch between tenant databases.
 */
public class TenantContext {

    private static final Logger log = LoggerFactory.getLogger(TenantContext.class);
    private static final ThreadLocal<Long> CURRENT_TENANT = new ThreadLocal<>();

    public static void set(Long tenantId) {
        log.debug("Setting tenant focus to: {}", tenantId);
        CURRENT_TENANT.set(tenantId);
    }

    public static Long get() {
        return CURRENT_TENANT.get();
    }

    public static void clear() {
        CURRENT_TENANT.remove();
    }
}
