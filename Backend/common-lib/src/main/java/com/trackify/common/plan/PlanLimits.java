package com.trackify.common.plan;

import com.trackify.common.enums.Plan;

public final class PlanLimits {

  private PlanLimits() {}

  public static int maxProjects(Plan plan) {
    if (plan == null) {
      return 3;
    }
    return switch (plan) {
      case FREE -> 3;
      case PRO -> 50;
      case ENTERPRISE -> Integer.MAX_VALUE;
    };
  }

  public static int maxUsers(Plan plan) {
    if (plan == null) {
      return 5;
    }
    return switch (plan) {
      case FREE -> 5;
      case PRO -> 100;
      case ENTERPRISE -> Integer.MAX_VALUE;
    };
  }
}
