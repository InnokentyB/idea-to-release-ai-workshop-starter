export const STORAGE_KEY = 'event-applications-v1';

// Temporary checklist authorized in DL-103; replace after the owner supplies it.
export const mandatoryTasks: string[] = [
  'Подтвердить площадку',
  'Согласовать программу',
  'Уведомить участников',
  'Проверить оборудование',
];

export type Application = {
  id: string;
  title: string;
  status: 'pending' | 'returned' | 'approved';
  comment: string;
  tasks: { title: string; done: boolean }[];
};

export type Role = 'organizer' | 'approver';

export function createApplication(title: string, role: Role): Application {
  requireRole(role, 'organizer');
  const normalizedTitle = title.trim();
  if (!normalizedTitle) throw new Error('Укажите название мероприятия');
  return {
    id: crypto.randomUUID(),
    title: normalizedTitle,
    status: 'pending',
    comment: '',
    tasks: mandatoryTasks.map((taskTitle) => ({ title: taskTitle, done: false })),
  };
}

export function approveApplication(application: Application, role: Role): Application {
  requireRole(role, 'approver');
  requirePending(application);
  return { ...application, status: 'approved' };
}

export function returnApplication(application: Application, comment: string, role: Role): Application {
  requireRole(role, 'approver');
  requirePending(application);
  const normalizedComment = comment.trim();
  if (!normalizedComment) {
    throw new Error('Добавьте комментарий, чтобы вернуть заявку на доработку');
  }
  return { ...application, status: 'returned', comment: normalizedComment };
}

export function resubmitApplication(application: Application, title: string, role: Role): Application {
  requireRole(role, 'organizer');
  if (application.status !== 'returned') {
    throw new Error('Повторно отправить можно только заявку на доработке.');
  }
  const normalizedTitle = title.trim();
  if (!normalizedTitle) throw new Error('Укажите название мероприятия');
  return { ...application, title: normalizedTitle, status: 'pending' };
}

function requireRole(role: Role, expectedRole: Role): void {
  if (role !== expectedRole) {
    throw new Error(expectedRole === 'organizer'
      ? 'Это действие доступно только организатору.'
      : 'Это действие доступно только согласующему.');
  }
}

function requirePending(application: Application): void {
  if (application.status !== 'pending') {
    throw new Error('Решение уже принято. Доступны только заявки на согласовании.');
  }
}

export function toggleTask(application: Application, index: number, role: Role): Application {
  requireRole(role, 'organizer');
  if (application.status !== 'approved') {
    throw new Error('Подготовка доступна после согласования');
  }
  if (!Number.isInteger(index) || index < 0 || index >= application.tasks.length) {
    throw new Error('Задача не найдена');
  }
  return {
    ...application,
    tasks: application.tasks.map((task, taskIndex) =>
      taskIndex === index ? { ...task, done: !task.done } : task,
    ),
  };
}

export function remainingTasks(application: Application): number {
  return application.tasks.filter((task) => !task.done).length;
}

export function isReady(application: Application): boolean {
  return application.status === 'approved' &&
    application.tasks.length === mandatoryTasks.length && remainingTasks(application) === 0;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isNonblankString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function parseApplications(value: unknown): Application[] {
  const invalid = () => new Error(
    'Сохранённые заявки повреждены или имеют неподдерживаемый формат. Исходные данные сохранены.',
  );
  if (!Array.isArray(value)) throw invalid();
  const ids = new Set<string>();
  return value.map((item: unknown) => {
    if (!isRecord(item) || !isNonblankString(item.id) || !isNonblankString(item.title) ||
      (item.status !== 'pending' && item.status !== 'returned' && item.status !== 'approved') ||
      typeof item.comment !== 'string' ||
      (item.status === 'returned' && !item.comment.trim()) ||
      !Array.isArray(item.tasks) || item.tasks.length !== mandatoryTasks.length || ids.has(item.id)) {
      throw invalid();
    }
    ids.add(item.id);
    const tasks = item.tasks.map((task: unknown, index: number) => {
      if (!isRecord(task) || task.title !== mandatoryTasks[index] || typeof task.done !== 'boolean') {
        throw invalid();
      }
      if (item.status !== 'approved' && task.done) throw invalid();
      return { title: mandatoryTasks[index], done: task.done };
    });
    return { id: item.id, title: item.title, status: item.status, comment: item.comment, tasks };
  });
}

export function loadApplications(): { applications: Application[]; error: string | null } {
  let stored: string | null;
  try {
    stored = localStorage.getItem(STORAGE_KEY);
  } catch {
    return { applications: [], error: 'Не удалось прочитать заявки из хранилища браузера.' };
  }
  if (stored === null) return { applications: [], error: null };
  try {
    return { applications: parseApplications(JSON.parse(stored)), error: null };
  } catch (error) {
    return {
      applications: [],
      error: error instanceof SyntaxError
        ? 'Сохранённые заявки повреждены. Исходные данные сохранены.'
        : error instanceof Error ? error.message : 'Не удалось прочитать сохранённые заявки.',
    };
  }
}

export function saveApplications(applications: Application[]): void {
  const validated = parseApplications(applications);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(validated));
  } catch {
    throw new Error('Не удалось сохранить заявки в браузере. Изменения не сохранены.');
  }
}
