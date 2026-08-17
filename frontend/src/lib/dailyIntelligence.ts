import type { Task } from "../types/context";
import {
  getDeadlineStatus,
  type DeadlineStatus,
} from "./deadline";

export interface DailyIntelligence {
  totalTasks: number;
  completedTasks: number;
  remainingTasks: number;

  overdueTasks: number;
  todayTasks: number;
  tomorrowTasks: number;
  upcomingTasks: number;

  completedMinutes: number;
  remainingMinutes: number;
  totalEstimatedMinutes: number;

  hasUrgentWork: boolean;
  hasDeadlineToday: boolean;
  hasDeadlineTomorrow: boolean;

  completionPercentage: number;
}

export function getDailyIntelligence(
  tasks: Task[]
): DailyIntelligence {
  const completedTasks = tasks.filter(
    (task) => task.completed
  );

  const remainingTasks = tasks.filter(
    (task) => !task.completed
  );

  /*
   * ============================================
   * DEADLINE COUNTS
   * ============================================
   */

  let overdueTasks = 0;
  let todayTasks = 0;
  let tomorrowTasks = 0;
  let upcomingTasks = 0;

  /*
   * ============================================
   * TIME COUNTS
   * ============================================
   */

  let completedMinutes = 0;
  let remainingMinutes = 0;

  /*
   * ============================================
   * COMPLETED TASKS
   * ============================================
   */

  for (const task of completedTasks) {
    completedMinutes += Math.max(
      0,
      task.estimated_minutes
    );
  }

  /*
   * ============================================
   * REMAINING TASKS
   * ============================================
   */

  for (const task of remainingTasks) {
    remainingMinutes += Math.max(
      0,
      task.estimated_minutes
    );

    const status: DeadlineStatus =
      getDeadlineStatus(
        task.deadline
      );

    switch (status) {
      case "today":
        todayTasks++;
        break;

      case "tomorrow":
        tomorrowTasks++;
        break;

      case "upcoming":
        upcomingTasks++;
        break;

      case "unspecified":
        break;
    }
  }

  /*
   * ============================================
   * OVERDUE
   * ============================================
   *
   * The current deadline.ts does not have an
   * "overdue" status.
   *
   * Therefore we do NOT invent overdue data.
   *
   * This remains 0 until deadline.ts gains
   * explicit overdue detection.
   */

  overdueTasks = 0;

  /*
   * ============================================
   * TOTALS
   * ============================================
   */

  const totalTasks = tasks.length;

  const totalEstimatedMinutes =
    tasks.reduce(
      (total, task) =>
        total +
        Math.max(
          0,
          task.estimated_minutes
        ),
      0
    );

  const completionPercentage =
    totalTasks === 0
      ? 0
      : Math.round(
          (completedTasks.length /
            totalTasks) *
            100
        );

  /*
   * ============================================
   * INTELLIGENCE FLAGS
   * ============================================
   */

  const hasDeadlineToday =
    todayTasks > 0;

  const hasDeadlineTomorrow =
    tomorrowTasks > 0;

  const hasUrgentWork =
    overdueTasks > 0 ||
    todayTasks > 0;

  /*
   * ============================================
   * RETURN
   * ============================================
   */

  return {
    totalTasks,

    completedTasks:
      completedTasks.length,

    remainingTasks:
      remainingTasks.length,

    overdueTasks,

    todayTasks,

    tomorrowTasks,

    upcomingTasks,

    completedMinutes,

    remainingMinutes,

    totalEstimatedMinutes,

    hasUrgentWork,

    hasDeadlineToday,

    hasDeadlineTomorrow,

    completionPercentage,
  };
}