import type {
  Task,
  TimePlan,
  PlannedTask,
} from "../types/context";

import { getDeadlineStatus } from "./deadline";

/*
 * ============================================
 * NUMBER WORDS
 * ============================================
 */

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

/*
 * ============================================
 * PARSE NUMBER
 * ============================================
 */

function parseNumber(value: string): number {
  const normalized = value
    .toLowerCase()
    .trim();

  if (
    numberWords[normalized] !== undefined
  ) {
    return numberWords[normalized];
  }

  const number = Number(normalized);

  return Number.isFinite(number)
    ? number
    : 0;
}

/*
 * ============================================
 * PARSE AVAILABLE TIME
 * ============================================
 *
 * Supports:
 *
 * "2 hours"
 * "two hours"
 * "90 minutes"
 * "1 hour 30 minutes"
 * "two hours and 30 minutes"
 * "120"
 * "not specified"
 */

function parseAvailableMinutes(
  value: string
): number {
  if (!value) {
    return 0;
  }

  const text = value
    .toLowerCase()
    .trim();

  if (
    !text ||
    text === "not specified" ||
    text === "none" ||
    text === "no time" ||
    text === "no available time"
  ) {
    return 0;
  }

  let minutes = 0;

  const numberPattern =
    "\\d+(?:\\.\\d+)?|zero|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve";

  /*
   * HOURS
   */

  const hourMatch = text.match(
    new RegExp(
      `(${numberPattern})\\s*hours?`
    )
  );

  if (hourMatch) {
    minutes +=
      parseNumber(hourMatch[1]) * 60;
  }

  /*
   * MINUTES
   */

  const minuteMatch = text.match(
    new RegExp(
      `(${numberPattern})\\s*minutes?`
    )
  );

  if (minuteMatch) {
    minutes += parseNumber(
      minuteMatch[1]
    );
  }

  /*
   * PLAIN NUMBER
   *
   * Example:
   * "120"
   *
   * Treated as minutes.
   */

  if (
    minutes === 0 &&
    /^\d+(?:\.\d+)?$/.test(text)
  ) {
    minutes = Number(text);
  }

  return Math.max(
    0,
    Math.round(minutes)
  );
}

/*
 * ============================================
 * DEADLINE SCORE
 * ============================================
 *
 * Lower number = more urgent.
 *
 * 0 = overdue
 * 1 = today
 * 2 = tomorrow
 * 3 = upcoming
 * 4 = unspecified
 */

function getDeadlineScore(
  deadline?: string
): number {
  const status =
    getDeadlineStatus(
      deadline ?? ""
    );

  switch (status) {
    case "overdue":
      return 0;

    case "today":
      return 1;

    case "tomorrow":
      return 2;

    case "upcoming":
      return 3;

    case "unspecified":
      return 4;

    default:
      return 4;
  }
}

/*
 * ============================================
 * PRIORITY SCORE
 * ============================================
 *
 * Higher number = higher priority.
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
 * TASK SCORE
 * ============================================
 *
 * Higher score = more important.
 *
 * Priority order:
 *
 * 1. Deadline urgency
 * 2. Priority
 * 3. Shorter task bonus
 */

function getTaskScore(
  task: Task
): number {
  const deadlineScore =
    getDeadlineScore(
      task.deadline
    );

  const priorityScore =
    getPriorityScore(
      task.priority
    );

  /*
   * Deadline has the strongest influence.
   */

  const deadlineWeight =
    (4 - deadlineScore) * 100;

  /*
   * Priority is second.
   */

  const priorityWeight =
    priorityScore * 10;

  /*
   * Small bonus for short tasks.
   *
   * This helps LifeOS complete smaller
   * tasks when urgency and priority are equal.
   */

  const durationBonus =
    task.estimated_minutes <= 30
      ? 0.3
      : task.estimated_minutes <= 60
        ? 0.15
        : 0;

  return (
    deadlineWeight +
    priorityWeight +
    durationBonus
  );
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
    parseAvailableMinutes(
      availableTime
    );

  /*
   * ==========================================
   * ONLY INCOMPLETE TASKS
   * ==========================================
   */

  const incompleteTasks = tasks
    .map((task, index) => ({
      task,
      index,
    }))
    .filter(
      ({ task }) => !task.completed
    );

  /*
   * ==========================================
   * SMART SORTING
   * ==========================================
   *
   * 1. Deadline
   * 2. Priority
   * 3. Shorter task
   * 4. Original order
   */

  incompleteTasks.sort((a, b) => {
    /*
     * Deadline
     */

    const deadlineA =
      getDeadlineScore(
        a.task.deadline
      );

    const deadlineB =
      getDeadlineScore(
        b.task.deadline
      );

    if (
      deadlineA !== deadlineB
    ) {
      return (
        deadlineA -
        deadlineB
      );
    }

    /*
     * Priority
     */

    const priorityA =
      getPriorityScore(
        a.task.priority
      );

    const priorityB =
      getPriorityScore(
        b.task.priority
      );

    if (
      priorityA !== priorityB
    ) {
      return (
        priorityB -
        priorityA
      );
    }

    /*
     * Combined score
     *
     * Keeps the scoring system relevant
     * when deadline and priority match.
     */

    const scoreA =
      getTaskScore(a.task);

    const scoreB =
      getTaskScore(b.task);

    if (scoreA !== scoreB) {
      return (
        scoreB -
        scoreA
      );
    }

    /*
     * Shorter task first.
     */

    if (
      a.task.estimated_minutes !==
      b.task.estimated_minutes
    ) {
      return (
        a.task.estimated_minutes -
        b.task.estimated_minutes
      );
    }

    /*
     * Original order.
     */

    return a.index - b.index;
  });

  /*
   * ==========================================
   * BUILD PLAN
   * ==========================================
   */

  let remaining =
    availableMinutes;

  const plannedTasks: PlannedTask[] =
    [];

  for (const item of incompleteTasks) {
    if (remaining <= 0) {
      break;
    }

    const taskMinutes = Math.max(
      1,
      item.task.estimated_minutes
    );

    /*
     * ========================================
     * ENTIRE TASK FITS
     * ========================================
     */

    if (
      taskMinutes <= remaining
    ) {
      plannedTasks.push({
        taskIndex: item.index,
        plannedMinutes:
          taskMinutes,
        fullTaskMinutes:
          taskMinutes,
        partial: false,
      });

      remaining -= taskMinutes;

      continue;
    }

    /*
     * ========================================
     * PARTIAL TASK
     * ========================================
     */

    plannedTasks.push({
      taskIndex: item.index,

      plannedMinutes:
        remaining,

      fullTaskMinutes:
        taskMinutes,

      partial: true,
    });

    remaining = 0;
  }

  /*
   * ==========================================
   * PLAN STATISTICS
   * ==========================================
   */

  const plannedMinutes =
    availableMinutes -
    remaining;

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

  const overflowMinutes =
    Math.max(
      0,
      totalIncompleteMinutes -
        plannedMinutes
    );

  /*
   * ==========================================
   * RETURN
   * ==========================================
   */

  return {
    availableMinutes,

    plannedMinutes,

    remainingMinutes:
      remaining,

    overflowMinutes,

    plannedTasks,
  };
}