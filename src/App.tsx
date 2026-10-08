import { useState } from "react";

interface EventDraft {
  title: string;
  date: string;
}

interface Task {
  id: string;
  title: string;
  completed: boolean;
}

export default function App() {
  const [draft, setDraft] = useState<EventDraft>({ title: "", date: "" });
  const [event, setEvent] = useState<EventDraft | null>(null);
  const [taskTitle, setTaskTitle] = useState("");
  const [tasks, setTasks] = useState<Task[]>([]);

  const remainingCount = tasks.filter((task) => !task.completed).length;

  if (event) {
    return (
      <main className="page-shell">
        <section className="workspace" aria-labelledby="event-title">
          <p className="eyebrow">План подготовки</p>
          <h1 id="event-title">{event.title}</h1>
          <p className="event-date">Дата события: {event.date}</p>
          <p className="counter" data-testid="remaining-count">Осталось задач: {remainingCount}</p>
          <form
            className="task-form"
            onSubmit={(formEvent) => {
              formEvent.preventDefault();
              const title = taskTitle.trim();
              if (!title) return;
              setTasks([...tasks, { id: crypto.randomUUID(), title, completed: false }]);
              setTaskTitle("");
            }}
          >
            <label>
              Новая задача
              <input value={taskTitle} onChange={(event) => setTaskTitle(event.target.value)} />
            </label>
            <button type="submit">Добавить задачу</button>
          </form>
          <ul className="task-list">
            {tasks.map((task) => (
              <li key={task.id}>
                <label className="task-row">
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => setTasks(tasks.map((item) => (
                      item.id === task.id ? { ...item, completed: !item.completed } : item
                    )))}
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
          onSubmit={(formEvent) => {
            formEvent.preventDefault();
            setEvent(draft);
          }}
        >
          <label>
            Название события
            <input
              value={draft.title}
              onChange={(event) => setDraft({ ...draft, title: event.target.value })}
            />
          </label>
          <label>
            Дата события
            <input
              type="date"
              value={draft.date}
              onChange={(event) => setDraft({ ...draft, date: event.target.value })}
            />
          </label>
          <button type="submit">Создать событие</button>
        </form>
      </section>
    </main>
  );
}
