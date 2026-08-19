export type DeadlineStatus =
  | "overdue"
  | "today"
  | "tomorrow"
  | "upcoming"
  | "unspecified";

export function getDeadlineStatus(
  deadline: string
): DeadlineStatus {
  const normalized = deadline
    .toLowerCase()
    .trim();

  /*
   * ============================================
   * NO DEADLINE
   * ============================================
   */

  if (
    !normalized ||
    normalized === "not specified" ||
    normalized === "none" ||
    normalized === "no deadline"
  ) {
    return "unspecified";
  }

  /*
   * ============================================
   * EXPLICIT OVERDUE
   * ============================================
   */

  if (
    normalized.includes("overdue") ||
    normalized.includes("past due") ||
    normalized.includes("missed")
  ) {
    return "overdue";
  }

  /*
   * ============================================
   * TODAY
   * ============================================
   */

  if (
    normalized.includes("today") ||
    normalized.includes("tonight")
  ) {
    return "today";
  }

  /*
   * ============================================
   * TOMORROW
   * ============================================
   */

  if (
    normalized.includes("tomorrow")
  ) {
    return "tomorrow";
  }

  /*
   * ============================================
   * FUTURE
   * ============================================
   */

  return "upcoming";
}