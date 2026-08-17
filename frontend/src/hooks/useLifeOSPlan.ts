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
   *
   * Example:
   *
   * Original:
   * "2 hours available tonight"
   *
   * User selects:
   * "30 minutes"
   *
   * The planner temporarily uses:
   * "30 minutes"
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
  const hasAvailableTime =
    Boolean(result?.available_time) &&
    result?.available_time
      .toLowerCase()
      .trim() !== "not specified";

  /*
   * ============================================
   * CURRENT PLANNING TIME
   * ============================================
   *
   * Override takes priority.
   *
   * Otherwise use the AI-extracted available time.
   */
  const planningTime =
    availableTimeOverride ??
    (hasAvailableTime
      ? result?.available_time ?? ""
      : "");

  /*
   * ============================================
   * GENERATE TIME PLAN
   * ============================================
   *
   * useMemo prevents unnecessary recalculation.
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
   */
  const setAvailableTime = (
    time: string
  ) => {
    setAvailableTimeOverride(time);
  };

  /*
   * ============================================
   * RESET AVAILABLE TIME
   * ============================================
   *
   * Returning to the original AI-detected
   * available time.
   */
  const resetAvailableTime = () => {
    setAvailableTimeOverride(null);
  };

  return {
    hasAvailableTime,
    planningTime,
    timePlan,
    setAvailableTime,
    resetAvailableTime,
  };
}