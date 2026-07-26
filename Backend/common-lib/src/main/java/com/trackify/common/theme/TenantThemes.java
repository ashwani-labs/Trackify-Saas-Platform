package com.trackify.common.theme;

import java.util.Map;
import java.util.Set;

public final class TenantThemes {

  public static final String DEFAULT = "indigo";

  private static final Map<String, String> PRIMARY_BY_THEME =
      Map.of(
          DEFAULT, "#6366f1", "ocean", "#0ea5e9", "emerald", "#059669", "rose", "#e11d48", "amber",
          "#d97706", "violet", "#7c3aed");

  private TenantThemes() {}

  public static Set<String> allowedThemes() {
    return PRIMARY_BY_THEME.keySet();
  }

  public static boolean isValid(String theme) {
    return theme != null && PRIMARY_BY_THEME.containsKey(theme.toLowerCase());
  }

  public static String normalize(String theme) {
    if (theme == null || theme.isBlank()) {
      return DEFAULT;
    }
    String normalized = theme.trim().toLowerCase();
    return PRIMARY_BY_THEME.containsKey(normalized) ? normalized : DEFAULT;
  }

  public static String primaryColorFor(String theme) {
    return PRIMARY_BY_THEME.getOrDefault(normalize(theme), PRIMARY_BY_THEME.get(DEFAULT));
  }
}
