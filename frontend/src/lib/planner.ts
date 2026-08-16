import type { Task, TimePlan } from "../types/context";

const numberWords: Record<string, number> = {
  zero: 0,
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10,
  eleven: 11,
  twelve: 12,
};

function parseNumber(value: string): number {
  const normalized = value.toLowerCase().trim();

  if (numberWords[normalized] !== undefined) {
    return numberWords[normalized];
  }

  return Number(normalized);
}

function parseAvailableMinutes(value: string): number {
  const text = value.toLowerCase();

  let minutes = 0;

  const hourMatch = text.match(
    /(\d+(?:\.\d+)?|zero|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve)\s*hours?/
  );

  const minuteMatch = text.match(
    /(\d+)\s*minutes?/
  );

  if (hourMatch) {
    minutes += parseNumber(hourMatch[1]) * 60;
  }

  if (minuteMatch) {
    minutes += Number(minuteMatch[1]);
  }

  return Math.round(minutes);
}

/*
 * ============================================
 * PLANNED TASK
 * ============================================
 */
export interface PlannedTask {
  taskIndex: number;
  plannedMinutes: number;
  fullTaskMinutes: number;
  partial: boolean;
}

/*
 * ============================================
 * TIME PLAN
 * ============================================
 */
export interface TimePlan {
  availableMinutes: number;
  plannedMinutes: number;
  remainingMinutes: number;
  overflowMinutes: number;
  plannedTasks: PlannedTask[];
}

/*
 * ============================================
 * PRIORITY SCORE
 * ============================================
 *
 * Higher number = more important.
 *
 * We use a score instead of simply sorting
 * high/medium/low so we can combine:
 *
 * - Priority
 * - Deadline urgency
 * - Task duration
 *
 * later if the backend provides more data.
 */
function getPriorityScore(
  priority: Task["priority"]
): number {
  switch (priority) {
    case "high":
      return 3;

    case "medium":
      return 2;

    case "low":
      return 1;

    default:
      return 1;
  }
}

/*
 * ============================================
 * TASK URGENCY SCORE
 * ============================================
 *
 * At the moment, Task does not necessarily
 * contain a structured deadline field.
 *
 * Therefore we safely use priority as the
 * primary urgency signal.
 *
 * This keeps the planner compatible with the
 * current backend response.
 */
function getTaskScore(task: Task): number {
  const priorityScore =
    getPriorityScore(task.priority);

  /*
   * Shorter tasks receive a small efficiency
   * bonus.
   *
   * Example:
   *
   * High priority / 30 min
   * High priority / 180 min
   *
   * When priority is equal, completing the
   * shorter task can create faster progress.
   */
  const durationBonus =
    task.estimated_minutes <= 30
      ? 0.3
      : task.estimated_minutes <= 60
        ? 0.15
        : 0;

  return priorityScore + durationBonus;
}

/*
 * ============================================
 * CREATE TIME PLAN
 * ============================================
 */
export function createTimePlan(
  tasks: Task[],
  availableTime: string
): TimePlan {
  const availableMinutes =
    parseAvailableMinutes(availableTime);

  /*
   * Get incomplete tasks.
   */
  const incompleteTasks = tasks
    .map((task, index) => ({
      task,
      index,
    }))
    .filter(({ task }) => !task.completed);

  /*
   * ==========================================
   * SMART TASK SORTING
   * ==========================================
   *
   * The planner now considers:
   *
   * 1. Priority
   * 2. Task efficiency
   * 3. Original order as a stable fallback
   */
  incompleteTasks.sort((a, b) => {
    const scoreA = getTaskScore(a.task);
    const scoreB = getTaskScore(b.task);

    if (scoreA !== scoreB) {
      return scoreB - scoreA;
    }

    return a.index - b.index;
  });

  let remaining = availableMinutes;

  const plannedTasks: PlannedTask[] = [];

  /*
   * ==========================================
   * BUILD PLAN
   * ==========================================
   */
  for (const item of incompleteTasks) {
    if (remaining <= 0) {
      break;
    }

    const taskMinutes =
      Math.max(
        1,
        item.task.estimated_minutes
      );

    /*
     * ------------------------------------------
     * ENTIRE TASK FITS
     * ------------------------------------------
     */
    if (taskMinutes <= remaining) {
      plannedTasks.push({
        taskIndex: item.index,

        plannedMinutes: taskMinutes,

        fullTaskMinutes: taskMinutes,

        partial: false,
      });

      remaining -= taskMinutes;

      continue;
    }

    /*
     * ------------------------------------------
     * PARTIAL TASK
     * ------------------------------------------
     *
     * Instead of wasting the remaining time,
     * LifeOS uses it to start the next important
     * task.
     */
    if (remaining > 0) {
      plannedTasks.push({
        taskIndex: item.index,

        plannedMinutes: remaining,

        fullTaskMinutes: taskMinutes,

        partial: true,
      });

      remaining = 0;
    }
  }

  /*
   * ============================================
   * CALCULATE PLAN STATISTICS
   * ============================================
   */
  const plannedMinutes =
    availableMinutes - remaining;

  const totalIncompleteMinutes =
    incompleteTasks.reduce(
      (total, item) =>
        total +
        Math.max(
          1,
          item.task.estimated_minutes
        ),
      0
    );

  const overflowMinutes = Math.max(
    0,
    totalIncompleteMinutes - plannedMinutes
  );

  /*
   * ============================================
   * RETURN PLAN
   * ============================================
   */
  return {
    availableMinutes,

    plannedMinutes,

    remainingMinutes: remaining,

    overflowMinutes,

    plannedTasks,
  };
}