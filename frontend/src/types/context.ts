export type Priority = "low" | "medium" | "high";

export interface Task {
  title: string;
  priority: Priority;
  estimated_minutes: number;
  completed: boolean;

  /*
   * Deadline associated with this task.
   *
   * Example:
   * "tomorrow"
   * "Friday"
   * "2026-08-18"
   *
   * Optional because not every task has a deadline.
   */
  deadline?: string;
}

export interface Deadline {
  title: string;
  deadline: string;
}

export interface ContextResponse {
  goals: string[];

  tasks: Task[];

  deadlines: Deadline[];

  available_time: string;

  recommended_action: string;

  reasoning: string;
}

export interface PlannedTask {
  taskIndex: number;
  plannedMinutes: number;
  fullTaskMinutes: number;
  partial: boolean;
}

export interface TimePlan {
  availableMinutes: number;
  plannedMinutes: number;
  remainingMinutes: number;
  overflowMinutes: number;
  plannedTasks: PlannedTask[];
}