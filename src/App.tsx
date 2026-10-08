import { useEffect, useState } from "react";
import {
  loadWorkspace,
  saveWorkspace,
  type EventData,
  type Workspace,
} from "./workspace-storage";

interface EventErrors {
  title?: string;
  date?: string;
}

function todayAsInputValue() {
  const today = new Date();
  const offset = today.getTimezoneOffset() * 60_000;
  return new Date(today.getTime() - offset).toISOString().slice(0, 10);
}

function validateEvent(draft: EventData): EventErrors {
  const errors: EventErrors = {};
  if (!draft.title.trim()) errors.title = "Введите название события";
  if (!draft.date) errors.date = "Выберите дату события";
  else if (draft.date < todayAsInputValue()) errors.date = "Дата события не может быть в прошлом";
  return errors;
}

export default function App() {
  const [draft, setDraft] = useState<EventData>({ title: "", date: "" });
  const [workspace, setWorkspace] = useState<Workspace>(loadWorkspace);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskError, setTaskError] = useState("");
  const [errors, setErrors] = useState<EventErrors>({});
  const [storageFailed, setStorageFailed] = useState(false);

  useEffect(() => {
    if (workspace.event) setStorageFailed(!saveWorkspace(workspace));
  }, [workspace]);

  const remainingCount = workspace.tasks.filter((task) => !task.completed).length;

  if (workspace.event) {
    return (
      <main className="page-shell">
        <section className="workspace" aria-labelledby="event-title">
          <p className="eyebrow">План подготовки</p>
          <h1 id="event-title">{workspace.event.title}</h1>
          <p className="event-date">Дата события: {workspace.event.date}</p>
          <p className="counter" data-testid="remaining-count">Осталось задач: {remainingCount}</p>
          {storageFailed && <p className="error" role="alert">Не удалось сохранить изменения в браузере</p>}
          <form
            className="task-form"
            onSubmit={(formEvent) => {
              formEvent.preventDefault();
              const title = taskTitle.trim();
              if (!title) {
                setTaskError("Введите задачу");
                return;
              }
              setWorkspace((current) => ({
                ...current,
                tasks: [...current.tasks, { id: crypto.randomUUID(), title, completed: false }],
              }));
              setTaskTitle("");
              setTaskError("");
            }}
          >
            <label>
              Новая задача
              <input
                aria-describedby={taskError ? "task-error" : undefined}
                aria-invalid={Boolean(taskError)}
                value={taskTitle}
                onChange={(event) => {
                  setTaskTitle(event.target.value);
                  if (taskError) setTaskError("");
                }}
              />
            </label>
            {taskError && <p className="error" id="task-error">{taskError}</p>}
            <button type="submit">Добавить задачу</button>
          </form>
          <ul className="task-list">
            {workspace.tasks.map((task) => (
              <li key={task.id}>
                <label className="task-row">
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => setWorkspace((current) => ({
                      ...current,
                      tasks: current.tasks.map((item) => (
                        item.id === task.id ? { ...item, completed: !item.completed } : item
                      )),
                    }))}
                  />
                  <span className={task.completed ? "completed" : ""}>{task.title}</span>
                </label>
              </li>
            ))}
          </ul>
        </section>
      </main>
    );
  }

  return (
    <main className="page-shell">
      <section className="workspace" aria-labelledby="page-title">
        <p className="eyebrow">От идеи до релиза с AI</p>
        <h1 id="page-title">Подготовьте событие</h1>
        <p className="lead">Создайте событие, а затем соберите список задач.</p>
        <form
          className="event-form"
          noValidate
          onSubmit={(formEvent) => {
            formEvent.preventDefault();
            const nextErrors = validateEvent(draft);
            setErrors(nextErrors);
            if (Object.keys(nextErrors).length === 0) {
              setWorkspace({ event: { ...draft, title: draft.title.trim() }, tasks: [] });
            }
          }}
        >
          <label>
            Название события
            <input
              aria-describedby={errors.title ? "title-error" : undefined}
              aria-invalid={Boolean(errors.title)}
              value={draft.title}
              onChange={(event) => setDraft({ ...draft, title: event.target.value })}
            />
          </label>
          {errors.title && <p className="error" id="title-error">{errors.title}</p>}
          <label>
            Дата события
            <input
              aria-describedby={errors.date ? "date-error" : undefined}
              aria-invalid={Boolean(errors.date)}
              type="date"
              value={draft.date}
              onChange={(event) => setDraft({ ...draft, date: event.target.value })}
            />
          </label>
          {errors.date && <p className="error" id="date-error">{errors.date}</p>}
          <button type="submit">Создать событие</button>
        </form>
      </section>
    </main>
  );
}
