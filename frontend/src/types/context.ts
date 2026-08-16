export type Priority = "low" | "medium" | "high";

export interface Task {
  title: string;
  priority: Priority;
  estimated_minutes: number;
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