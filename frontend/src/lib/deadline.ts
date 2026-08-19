export type DeadlineStatus =
  | "overdue"
  | "today"
  | "tomorrow"
  | "upcoming"
  | "unspecified";

/**
 * Classifies a deadline into a simple status.
 *
 * Note:
 * This detects overdue only when the text explicitly
 * contains words such as "overdue", "past due", or "missed".
 *
 * It does not yet calculate overdue status from actual
 * calendar dates.
 */
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
   * OVERDUE
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

  if (normalized.includes("tomorrow")) {
    return "tomorrow";
  }

  /*
   * ============================================
   * FUTURE / UPCOMING
   * ============================================
   */

  return "upcoming";
}