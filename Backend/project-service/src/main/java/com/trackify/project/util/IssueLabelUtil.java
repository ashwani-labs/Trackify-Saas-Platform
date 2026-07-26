package com.trackify.project.util;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;

public final class IssueLabelUtil {

  private IssueLabelUtil() {}

  public static String serialize(List<String> labels) {
    if (labels == null || labels.isEmpty()) {
      return null;
    }
    Set<String> normalized = new LinkedHashSet<>();
    for (String label : labels) {
      String value = normalize(label);
      if (!value.isEmpty()) {
        normalized.add(value);
      }
    }
    if (normalized.isEmpty()) {
      return null;
    }
    return String.join(",", normalized);
  }

  public static List<String> deserialize(String labels) {
    if (labels == null || labels.isBlank()) {
      return List.of();
    }
    return Arrays.stream(labels.split(","))
        .map(IssueLabelUtil::normalize)
        .filter(value -> !value.isEmpty())
        .toList();
  }

  public static String normalize(String label) {
    if (label == null) {
      return "";
    }
    return label.trim().toLowerCase(Locale.ROOT);
  }

  public static List<String> distinctProjectLabels(List<String> rawValues) {
    Set<String> labels = new LinkedHashSet<>();
    for (String raw : rawValues) {
      labels.addAll(deserialize(raw));
    }
    return new ArrayList<>(labels);
  }
}
