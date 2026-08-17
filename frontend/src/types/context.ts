/*
 * ============================================
 * PRIORITY
 * ============================================
 */

export type Priority =
  | "low"
  | "medium"
  | "high";

/*
 * ============================================
 * TASK
 * ============================================
 */

export interface Task {
  title: string;

  priority: Priority;

  estimated_minutes: number;

  /*
   * Frontend-owned state.
   *
   * The backend does not generate this.
   * React adds and updates it.
   */
  completed: boolean;

  /*
   * Optional because the backend may return
   * "Not specified" when no deadline exists.
   */
  deadline?: string;
}

/*
 * ============================================
 * DEADLINE
 * ============================================
 */

export interface Deadline {
  title: string;

  deadline: string;
}

/*
 * ============================================
 * CONTEXT RESPONSE
 * ============================================
 */

export interface ContextResponse {
  goals: string[];

  tasks: Task[];

  deadlines: Deadline[];

  available_time: string;

  recommended_action: string;

  reasoning: string;
}

/*
 * ============================================
 * PLANNED TASK
 * ============================================
 */

export interface PlannedTask {
  /*
   * Index of the task inside result.tasks.
   */
  taskIndex: number;

  /*
   * Amount of time allocated in the plan.
   */
  plannedMinutes: number;

  /*
   * Original estimated task duration.
   */
  fullTaskMinutes: number;

  /*
   * True when only part of the task fits
   * into the available time.
   */
  partial: boolean;
}

/*
 * ============================================
 * TIME PLAN
 * ============================================
 */

export interface TimePlan {
  /*
   * Total time the user has available.
   */
  availableMinutes: number;

  /*
   * Time allocated to planned tasks.
   */
  plannedMinutes: number;

  /*
   * Time left unused.
   */
  remainingMinutes: number;

  /*
   * Amount of work that could not fit
   * into the available time.
   */
  overflowMinutes: number;

  /*
   * Tasks selected for the plan.
   */
  plannedTasks: PlannedTask[];
}