import type {
  Task,
  TimePlan,
  PlannedTask,
} from "../types/context";

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
  const normalized = value.toLowerCase().trim();

  if (numberWords[normalized] !== undefined) {
    return numberWords[normalized];
  }

  const number = Number(normalized);

  return Number.isFinite(number) ? number : 0;
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
 * "Not specified"
 */

function parseAvailableMinutes(value: string): number {
  if (!value) {
    return 0;
  }

  const text = value.toLowerCase().trim();

  if (
    !text ||
    text === "not specified" ||
    text === "none"
  ) {
    return 0;
  }

  let minutes = 0;

  const numberPattern =
    "\\d+(?:\\.\\d+)?|zero|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve";

  const hourMatch = text.match(
    new RegExp(
      `(${numberPattern})\\s*hours?`
    )
  );

  const minuteMatch = text.match(
    /(\d+)\s*minutes?/
  );

  if (hourMatch) {
    minutes +=
      parseNumber(hourMatch[1]) * 60;
  }

  if (minuteMatch) {
    minutes += Number(minuteMatch[1]);
  }

  /*
   * Support plain values such as:
   *
   * "120"
   *
   * Treat them as minutes.
   */
  if (
    minutes === 0 &&
    /^\d+$/.test(text)
  ) {
    minutes = Number(text);
  }

  return Math.max(0, Math.round(minutes));
}

/*
 * ============================================
 * DEADLINE URGENCY
 * ============================================
 *
 * Lower number = more urgent.
 *
 * 0 = today
 * 1 = tomorrow
 * 2 = this week
 * 3 = later
 * 4 = unspecified
 */

function getDeadlineScore(
  deadline?: string
): number {
  const normalized =
    deadline?.toLowerCase().trim() ?? "";

  if (
    !normalized ||
    normalized === "not specified"
  ) {
    return 4;
  }

  /*
   * Today / tonight
   */
  if (
    normalized.includes("today") ||
    normalized.includes("tonight")
  ) {
    return 0;
  }

  /*
   * Tomorrow
   */
  if (normalized.includes("tomorrow")) {
    return 1;
  }

  /*
   * Yesterday = overdue
   */
  if (normalized.includes("yesterday")) {
    return 0;
  }

  /*
   * Weekday
   */
  const weekdayPattern =
    /\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/;

  if (weekdayPattern.test(normalized)) {
    return 2;
  }

  /*
   * Month names
   */
  const monthPattern =
    /\b(january|february|march|april|may|june|july|august|september|october|november|december)\b/;

  if (monthPattern.test(normalized)) {
    return 3;
  }

  /*
   * Numeric dates
   *
   * Examples:
   * 2026-08-20
   * 08/20
   * 20/08/2026
   */
  if (
    /\d{1,4}[-/]\d{1,2}(?:[-/]\d{1,4})?/.test(
      normalized
    )
  ) {
    return 3;
  }

  /*
   * Generic future wording
   */
  if (
    normalized.includes("next") ||
    normalized.includes("later")
  ) {
    return 3;
  }

  return 4;
}

/*
 * ============================================
 * PRIORITY SCORE
 * ============================================
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
 */

function getTaskScore(task: Task): number {
  const deadlineScore =
    getDeadlineScore(task.deadline);

  const priorityScore =
    getPriorityScore(task.priority);

  /*
   * Deadline has the strongest influence.
   */
  const deadlineWeight =
    (4 - deadlineScore) * 100;

  /*
   * Priority is the second strongest factor.
   */
  const priorityWeight =
    priorityScore * 10;

  /*
   * Small efficiency bonus.
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
   * Only incomplete tasks are planned.
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
   * 1. Deadline urgency
   * 2. Priority
   * 3. Shorter task
   * 4. Original order
   */
  incompleteTasks.sort((a, b) => {
    const scoreA = getTaskScore(a.task);
    const scoreB = getTaskScore(b.task);

    if (scoreA !== scoreB) {
      return scoreB - scoreA;
    }

    if (
      a.task.estimated_minutes !==
      b.task.estimated_minutes
    ) {
      return (
        a.task.estimated_minutes -
        b.task.estimated_minutes
      );
    }

    return a.index - b.index;
  });

  /*
   * ==========================================
   * BUILD PLAN
   * ==========================================
   */

  let remaining = availableMinutes;

  const plannedTasks: PlannedTask[] = [];

  for (const item of incompleteTasks) {
    if (remaining <= 0) {
      break;
    }

    const taskMinutes = Math.max(
      1,
      item.task.estimated_minutes
    );

    /*
     * Entire task fits.
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
     * Only part of the task fits.
     */
    plannedTasks.push({
      taskIndex: item.index,
      plannedMinutes: remaining,
      fullTaskMinutes: taskMinutes,
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
    remainingMinutes: remaining,
    overflowMinutes,
    plannedTasks,
  };
}