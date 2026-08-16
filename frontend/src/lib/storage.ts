import type { ContextResponse } from "../types/context";

const STORAGE_KEY = "lifeos_current_state";

export function saveLifeOSState(
  state: ContextResponse
): void {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(state)
  );
}

export function loadLifeOSState():
  | ContextResponse
  | null {
  const stored = localStorage.getItem(STORAGE_KEY);

  if (!stored) {
    return null;
  }

  try {
    return JSON.parse(stored) as ContextResponse;
  } catch (error) {
    console.error(
      "Failed to load LifeOS state:",
      error
    );

    return null;
  }
}

export function clearLifeOSState(): void {
  localStorage.removeItem(STORAGE_KEY);
}