import { useMemo, useState } from "react";

import { createTimePlan } from "../lib/planner";
import type { ContextResponse } from "../types/context";

export function useLifeOSPlan(
  result: ContextResponse | null
) {
  const [availableTimeOverride, setAvailableTimeOverride] =
    useState<string | null>(null);

  const hasAvailableTime =
    Boolean(result?.available_time) &&
    result?.available_time.toLowerCase() !==
      "not specified";

  const planningTime =
    availableTimeOverride ??
    (hasAvailableTime
      ? result?.available_time ?? ""
      : "");

  const timePlan = useMemo(() => {
    if (!result) {
      return {
        availableMinutes: 0,
        plannedMinutes: 0,
        remainingMinutes: 0,
        overflowMinutes: 0,
        plannedTasks: [],
      };
    }

    return createTimePlan(
      result.tasks,
      planningTime
    );
  }, [result, planningTime]);

  const setAvailableTime = (
    time: string
  ) => {
    setAvailableTimeOverride(time);
  };

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