export default function App() {
  return (
    <main className="page-shell">
      <section className="card" aria-labelledby="page-title">
        <p className="eyebrow">От идеи до релиза с AI</p>
        <h1 id="page-title">WORKSHOP READY</h1>
        <p className="lead">
          Среда подготовлена. На воркшопе здесь появится первая рабочая версия продукта.
        </p>
        <div className="status" role="status">
          <span className="status-dot" aria-hidden="true" />
          Проект запускается и готов к публикации
        </div>
      </section>
    </main>
  );
}
