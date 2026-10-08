export const STORAGE_KEY = "workshop-event-checklist";

export interface EventData {
  title: string;
  date: string;
}

export interface ChecklistTask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Workspace {
  event: EventData | null;
  tasks: ChecklistTask[];
}

const EMPTY_WORKSPACE: Workspace = { event: null, tasks: [] };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isEventData(value: unknown): value is EventData {
  return isRecord(value) && typeof value.title === "string" && typeof value.date === "string";
}

function isChecklistTask(value: unknown): value is ChecklistTask {
  return isRecord(value)
    && typeof value.id === "string"
    && typeof value.title === "string"
    && typeof value.completed === "boolean";
}

export function loadWorkspace(): Workspace {
  try {
    const serialized = localStorage.getItem(STORAGE_KEY);
    if (!serialized) return EMPTY_WORKSPACE;
    const value: unknown = JSON.parse(serialized);
    if (!isRecord(value) || value.version !== 1 || !isEventData(value.event)) return EMPTY_WORKSPACE;
    if (!Array.isArray(value.tasks) || !value.tasks.every(isChecklistTask)) return EMPTY_WORKSPACE;
    return { event: value.event, tasks: value.tasks };
  } catch {
    return EMPTY_WORKSPACE;
  }
}

export function saveWorkspace(workspace: Workspace): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, ...workspace }));
    return true;
  } catch {
    return false;
  }
}
