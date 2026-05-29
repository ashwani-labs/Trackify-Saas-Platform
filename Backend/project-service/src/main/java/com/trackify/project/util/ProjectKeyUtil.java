package com.trackify.project.util;

import lombok.experimental.UtilityClass;

@UtilityClass
public class ProjectKeyUtil {

  public String deriveBaseKey(String projectName) {
    String base = projectName.replaceAll("[^A-Za-z0-9]", "").toUpperCase();
    if (base.isEmpty()) {
      return "PRJ";
    }
    return base.substring(0, Math.min(10, base.length()));
  }
}
