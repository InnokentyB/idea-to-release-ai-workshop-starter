import { useState } from "react";

interface EventDraft {
  title: string;
  date: string;
}

export default function App() {
  const [draft, setDraft] = useState<EventDraft>({ title: "", date: "" });
  const [event, setEvent] = useState<EventDraft | null>(null);

  if (event) {
    return (
      <main className="page-shell">
        <section className="workspace" aria-labelledby="event-title">
          <p className="eyebrow">План подготовки</p>
          <h1 id="event-title">{event.title}</h1>
          <p className="event-date">Дата события: {event.date}</p>
          <p className="counter" data-testid="remaining-count">Осталось задач: 0</p>
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
