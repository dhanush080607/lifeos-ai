export type DeadlineStatus =
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

  if (
    !normalized ||
    normalized === "not specified"
  ) {
    return "unspecified";
  }

  if (
    normalized.includes("today") ||
    normalized.includes("tonight")
  ) {
    return "today";
  }

  if (normalized.includes("tomorrow")) {
    return "tomorrow";
  }

  return "upcoming";
}