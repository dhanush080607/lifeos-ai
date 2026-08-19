import { useMemo, useState } from "react";

import { createTimePlan } from "../lib/planner";
import type {
  ContextResponse,
  TimePlan,
} from "../types/context";

interface LifeOSPlanState {
  hasAvailableTime: boolean;
  planningTime: string;
  timePlan: TimePlan;
  setAvailableTime: (time: string) => void;
  resetAvailableTime: () => void;
}

const EMPTY_TIME_PLAN: TimePlan = {
  availableMinutes: 0,
  plannedMinutes: 0,
  remainingMinutes: 0,
  overflowMinutes: 0,
  plannedTasks: [],
};

export function useLifeOSPlan(
  result: ContextResponse | null
): LifeOSPlanState {
  /*
   * ============================================
   * USER PLANNING OVERRIDE
   * ============================================
   */

  const [
    availableTimeOverride,
    setAvailableTimeOverride,
  ] = useState<string | null>(null);

  /*
   * ============================================
   * ORIGINAL AVAILABLE TIME
   * ============================================
   */

  const originalAvailableTime =
    result?.available_time
      ?.trim() ?? "";

  const normalizedAvailableTime =
    originalAvailableTime.toLowerCase();

  const hasAvailableTime =
    Boolean(originalAvailableTime) &&
    normalizedAvailableTime !==
      "not specified" &&
    normalizedAvailableTime !==
      "none" &&
    normalizedAvailableTime !==
      "no time" &&
    normalizedAvailableTime !==
      "no available time";

  /*
   * ============================================
   * CURRENT PLANNING TIME
   * ============================================
   *
   * User override takes priority.
   *
   * Otherwise use the available time extracted
   * by the AI.
   */

  const planningTime =
    availableTimeOverride ??
    (hasAvailableTime
      ? originalAvailableTime
      : "");

  /*
   * ============================================
   * GENERATE TIME PLAN
   * ============================================
   */

  const timePlan = useMemo(() => {
    if (!result || !planningTime) {
      return EMPTY_TIME_PLAN;
    }

    return createTimePlan(
      result.tasks,
      planningTime
    );
  }, [result, planningTime]);

  /*
   * ============================================
   * SET AVAILABLE TIME
   * ============================================
   *
   * Example:
   *
   * "15 minutes"
   * "30 minutes"
   * "1 hour"
   * "2 hours"
   */

  const setAvailableTime = (
    time: string
  ) => {
    setAvailableTimeOverride(
      time.trim()
    );
  };

  /*
   * ============================================
   * RESET AVAILABLE TIME
   * ============================================
   *
   * Return to the original AI-detected
   * available time.
   */

  const resetAvailableTime = () => {
    setAvailableTimeOverride(null);
  };

  /*
   * ============================================
   * RETURN
   * ============================================
   */

  return {
    hasAvailableTime,
    planningTime,
    timePlan,
    setAvailableTime,
    resetAvailableTime,
  };
}