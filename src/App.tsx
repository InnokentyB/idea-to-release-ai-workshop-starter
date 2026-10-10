import { useLayoutEffect, useRef, useState, type FormEvent } from 'react';
import {
  approveApplication,
  createApplication,
  isReady,
  loadApplications,
  remainingTasks,
  resubmitApplication,
  returnApplication,
  saveApplications,
  toggleTask,
  type Application,
  type Role,
} from './eventApplications';

const statusLabels: Record<Application['status'], string> = {
  pending: 'На согласовании',
  returned: 'На доработке',
  approved: 'Согласовано',
};

type QueueFilter = 'all' | 'pending' | 'returned' | 'preparation' | 'ready';
const queueFilters: { id: QueueFilter; label: string }[] = [
  { id: 'all', label: 'Все' }, { id: 'pending', label: 'На согласовании' },
  { id: 'returned', label: 'На доработке' }, { id: 'preparation', label: 'Подготовка' },
  { id: 'ready', label: 'Готово' },
];

export default function App() {
  const [initial] = useState(loadApplications);
  const [applications, setApplications] = useState(initial.applications);
  const [selectedId, setSelectedId] = useState(initial.applications[0]?.id ?? null);
  const [title, setTitle] = useState('');
  const [titleError, setTitleError] = useState<string | null>(null);
  const [comment, setComment] = useState('');
  const [decisionError, setDecisionError] = useState<string | null>(null);
  const [storageError, setStorageError] = useState(initial.error);
  const [role, setRole] = useState<Role>('organizer');
  const [correctedTitle, setCorrectedTitle] = useState(initial.applications[0]?.title ?? '');
  const [correctionError, setCorrectionError] = useState<string | null>(null);
  const [showOverview, setShowOverview] = useState(true);
  const [showNewForm, setShowNewForm] = useState(false);
  const [formOrigin, setFormOrigin] = useState<'overview' | 'detail'>('overview');
  const [queueFilter, setQueueFilter] = useState<QueueFilter>('all');
  const [query, setQuery] = useState('');
  const [focusRequest, setFocusRequest] = useState<{ target: 'overview' | 'detail' | 'title' | 'comment' | 'correction' } | null>(null);
  const overviewHeading = useRef<HTMLHeadingElement>(null);
  const detailHeading = useRef<HTMLHeadingElement>(null);
  const titleInput = useRef<HTMLInputElement>(null);
  const commentInput = useRef<HTMLTextAreaElement>(null);
  const correctionInput = useRef<HTMLInputElement>(null);
  const selected = applications.find((application) => application.id === selectedId);
  const visibleApplications = applications.filter((application) => {
    if (!application.title.toLocaleLowerCase('ru').includes(query.trim().toLocaleLowerCase('ru'))) return false;
    if (queueFilter === 'pending' || queueFilter === 'returned') return application.status === queueFilter;
    if (queueFilter === 'preparation') return application.status === 'approved' && !isReady(application);
    if (queueFilter === 'ready') return isReady(application);
    return true;
  });

  function rowAction(application: Application) {
    if (role === 'approver' && application.status === 'pending') return 'Рассмотреть заявку';
    if (role === 'organizer' && application.status === 'returned') return 'Исправить заявку';
    if (role === 'organizer' && application.status === 'approved' && !isReady(application)) return 'Продолжить подготовку';
    return 'Открыть';
  }

  useLayoutEffect(() => {
    if (!focusRequest) return;
    const targets = { overview: overviewHeading, detail: detailHeading, title: titleInput, comment: commentInput, correction: correctionInput };
    targets[focusRequest.target].current?.focus();
    setFocusRequest(null);
  }, [focusRequest, showOverview, showNewForm, selectedId]);

  function openOverview() {
    setShowOverview(true);
    setShowNewForm(false);
    setFocusRequest({ target: 'overview' });
  }

  function openNewApplication() {
    setFormOrigin(showOverview ? 'overview' : 'detail');
    setShowOverview(false);
    setShowNewForm(true);
    setFocusRequest({ target: 'title' });
  }

  function cancelNewApplication() {
    setShowNewForm(false);
    setShowOverview(formOrigin === 'overview');
    setTitleError(null);
    setFocusRequest({ target: formOrigin === 'overview' ? 'overview' : 'detail' });
  }

  function persist(next: Application[]) {
    setApplications(next);
    // Preserve unknown/corrupt original data; this session can still demonstrate the flow.
    if (initial.error) {
      setStorageError(`${initial.error} Изменения доступны только до обновления страницы и не сохранены. Сохранение заблокировано, чтобы не перезаписать исходные данные.`);
      return;
    }
    try {
      saveApplications(next);
      setStorageError(null);
    } catch (error) {
      setStorageError(error instanceof Error ? error.message : 'Не удалось сохранить заявки. Изменения не сохранены.');
    }
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      const application = createApplication(title, role);
      persist([application, ...applications]);
      setSelectedId(application.id);
      setShowOverview(false);
      setShowNewForm(false);
      setFocusRequest({ target: 'detail' });
      setTitle('');
      setTitleError(null);
      setComment('');
      setDecisionError(null);
      setCorrectedTitle(application.title);
      setCorrectionError(null);
    } catch (error) {
      setTitleError(error instanceof Error ? error.message : 'Не удалось создать заявку');
      setFocusRequest({ target: 'title' });
    }
  }

  function changeApplication(next: Application) {
    persist(applications.map((application) => application.id === next.id ? next : application));
  }

  function decide(action: 'approve' | 'return') {
    if (!selected) return;
    try {
      changeApplication(action === 'approve'
        ? approveApplication(selected, role)
        : returnApplication(selected, comment, role));
      setDecisionError(null);
      setFocusRequest({ target: 'detail' });
    } catch (error) {
      setDecisionError(error instanceof Error ? error.message : 'Не удалось записать решение');
      if (action === 'return') setFocusRequest({ target: 'comment' });
    }
  }

  function selectApplication(id: string) {
    setSelectedId(id);
    setShowOverview(false);
    setShowNewForm(false);
    setFocusRequest({ target: 'detail' });
    setComment('');
    setDecisionError(null);
    setCorrectedTitle(applications.find((application) => application.id === id)?.title ?? '');
    setCorrectionError(null);
  }

  function switchRole(nextRole: Role) {
    if (nextRole === role) return;
    setRole(nextRole);
    if (showOverview || (showNewForm && formOrigin === 'overview')) {
      setQueueFilter(nextRole === 'approver' ? 'pending' : 'all');
      setQuery('');
    }
    if (showNewForm) {
      setShowNewForm(false);
      setShowOverview(formOrigin === 'overview');
      setFocusRequest({ target: formOrigin === 'overview' ? 'overview' : 'detail' });
    }
    setTitleError(null);
    setComment('');
    setDecisionError(null);
    setCorrectedTitle(selected?.title ?? '');
    setCorrectionError(null);
  }

  function resubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected) return;
    try {
      const next = resubmitApplication(selected, correctedTitle, role);
      changeApplication(next);
      setCorrectedTitle(next.title);
      setCorrectionError(null);
      setFocusRequest({ target: 'detail' });
    } catch (error) {
      setCorrectionError(error instanceof Error ? error.message : 'Не удалось отправить заявку повторно');
      setFocusRequest({ target: 'correction' });
    }
  }

  return (
    <main className="page-shell">
      <header className="page-header">
        <div className="product-identity"><h1>Заявки на мероприятия</h1><p className="prototype-note">Локальный прототип</p></div>
        <div className="role-switch" role="group" aria-label="Роль в прототипе">
          <button type="button" aria-pressed={role === 'organizer'} onClick={() => switchRole('organizer')}>Организатор</button>
          <button type="button" aria-pressed={role === 'approver'} onClick={() => switchRole('approver')}>Согласующий</button>
        </div>
      </header>
      <div className="workspace-header">
        {!showOverview && <button type="button" className="text-button" onClick={openOverview}>Все заявки</button>}
        {showOverview && <h2 id="overview-heading" ref={overviewHeading} tabIndex={-1}>Все заявки</h2>}
        {showNewForm && <h2>Новая заявка</h2>}
        {role === 'organizer' && !showNewForm && <button type="button" className="primary new-action" onClick={openNewApplication}>Новая заявка</button>}
      </div>

      {storageError && <p role="alert" className="error storage-error">{storageError}</p>}

      {showNewForm && role === 'organizer' && <form className="submission-form" onSubmit={submit}>
        <p className="form-instruction">Укажите мероприятие, которое нужно согласовать.</p>
        <label htmlFor="event-title">Название мероприятия</label>
        <div className="submit-row"><input ref={titleInput} id="event-title" type="text" value={title} required placeholder="Например, встреча отдела" aria-invalid={titleError ? true : undefined} aria-describedby={titleError ? 'title-error' : undefined} onChange={(event) => { setTitle(event.target.value); setTitleError(null); }} />
        <button className="primary" type="submit">Подать заявку</button></div>
        <button type="button" className="text-button form-cancel" onClick={cancelNewApplication}>Отмена</button>
        {titleError && <p id="title-error" className="error" role="alert">{titleError}</p>}
      </form>}

      <div className={`workspace${showOverview ? ' overview-workspace' : ' detail-workspace'}`}>
        {showOverview ? (
          <section className="overview" aria-labelledby="overview-heading">
            <div className="queue-filters" role="group" aria-label="Фильтр заявок">
              {queueFilters.map((filter) => <button key={filter.id} type="button" aria-pressed={queueFilter === filter.id} onClick={() => setQueueFilter(filter.id)}>{filter.label}</button>)}
            </div>
            <div className="queue-search">
              <label className="sr-only" htmlFor="queue-search">Найти мероприятие</label>
              <input id="queue-search" type="text" value={query} placeholder="Найти мероприятие" onChange={(event) => setQuery(event.target.value)} />
              <p className="queue-count">{visibleApplications.length} из {applications.length} заявок</p>
            </div>
            {applications.length === 0 ? <div className="overview-empty"><h3>Заявок пока нет</h3><p>{role === 'organizer' ? 'Создайте первую заявку. Здесь будут её решение и подготовка.' : 'Организатор пока не подал ни одной заявки.'}</p></div> : visibleApplications.length === 0 ? <div className="overview-empty"><h3>Заявки не найдены</h3><p>Попробуйте другое название или покажите все состояния.</p><button type="button" className="secondary" onClick={() => { setQuery(''); setQueueFilter('all'); }}>Сбросить фильтры</button></div> : (
              <table className="applications-table" aria-label="Список заявок" role="table">
                <thead className="sr-only" role="rowgroup"><tr role="row">
                  <th scope="col" role="columnheader">Мероприятие</th>
                  <th scope="col" role="columnheader">Состояние заявки</th>
                  <th scope="col" role="columnheader">Решение</th>
                  <th scope="col" role="columnheader">Обязательные задачи</th>
                  <th scope="col" role="columnheader">Готовность</th>
                  <th scope="col" role="columnheader">Действие</th>
                </tr></thead>
                <tbody role="rowgroup">{visibleApplications.map((application) => (
                  <tr key={application.id} role="row">
                    <th scope="row" role="rowheader" data-label="Мероприятие">{application.title}</th>
                    <td className="queue-state" role="cell" data-label="Состояние заявки"><span className={`badge ${application.status}`}>{statusLabels[application.status]}</span></td>
                    <td className="queue-decision" role="cell" data-label="Решение">
                      <p>{application.status === 'pending' ? 'Ожидает решения' : application.status === 'approved' ? 'Согласовано' : 'Возвращено на доработку'}</p>
                      {application.comment && <div className="list-comment">
                        <span>{application.status === 'returned' ? 'Комментарий' : 'Последний возврат'}</span>
                        <p>{application.comment}</p>
                      </div>}
                    </td>
                    <td className="queue-tasks" role="cell" data-label="Обязательные задачи">Осталось: {remainingTasks(application)} из {application.tasks.length}</td>
                    <td className="queue-readiness" role="cell" data-label="Готовность"><span className={`badge ${isReady(application) ? 'ready' : 'waiting'}`}>{isReady(application) ? 'Готово' : 'Не готово'}</span></td>
                    <td className="queue-action" role="cell" data-label="Действие"><button type="button" className={`row-open${rowAction(application) !== 'Открыть' ? ' actionable' : ''}`} aria-label={`${rowAction(application)} ${application.title}`} onClick={() => selectApplication(application.id)}>{rowAction(application)}</button></td>
                  </tr>
                ))}</tbody>
              </table>
            )}
          </section>
        ) : showNewForm ? null : !selected ? (
          <section className="detail empty-state" aria-labelledby="empty-title">
            <h2 id="empty-title">Заявок пока нет</h2>
            <p>{role === 'organizer' ? 'Укажите название мероприятия. После подачи согласующий примет решение, а вы увидите, что осталось для подготовки.' : 'Здесь появятся заявки организатора. Для демонстрации переключитесь на роль организатора и подайте заявку.'}</p>

          </section>
        ) : (
          <div className="detail">
            <div className="detail-navigation"><button type="button" className="back-to-list" onClick={openOverview}>Вернуться к списку</button></div>
            <section className="application-summary" aria-label="Состояние заявки">
              <section className="review-region" aria-label="Согласование заявки">
                <header className="application-heading">
                  <h2 ref={detailHeading} tabIndex={-1}>{selected.title}</h2>
                  <p role="status" className={`badge ${selected.status}`}>{statusLabels[selected.status]}</p>
                </header>
                {selected.status === 'pending' && role === 'approver' ? (
                  <div className="review-form">
                    <label htmlFor="review-comment">Комментарий</label>
                    <textarea ref={commentInput} id="review-comment" value={comment} placeholder="Что нужно уточнить или исправить?"
                      aria-invalid={decisionError ? true : undefined}
                      aria-describedby={decisionError ? 'comment-note decision-error' : 'comment-note'}
                      onChange={(event) => { setComment(event.target.value); setDecisionError(null); }} />
                    <p id="comment-note" className="field-note">Обязателен при возврате на доработку.</p>
                    <div className="review-actions">
                      <button type="button" className="primary" onClick={() => decide('approve')}>Согласовать</button>
                      <button type="button" className="secondary" onClick={() => decide('return')}>Вернуть на доработку</button>
                    </div>
                    {decisionError && <p id="decision-error" className="error" role="alert">{decisionError}</p>}
                  </div>
                ) : null}
              </section>

              <div className="applicant-actions">
                {selected.status === 'pending' && role === 'organizer' && <p className="next-step">Ожидайте решения согласующего.</p>}
                {selected.status === 'approved' && <p className="next-step">Можно приступать к подготовке мероприятия</p>}
                {selected.comment && <div className="comment"><h3>{selected.status === 'returned' ? 'Комментарий согласующего' : 'Последний комментарий при возврате'}</h3><p>{selected.comment}</p></div>}
                {selected.status === 'returned' && <>
                  <p className="next-step">Исправьте заявку по комментарию и отправьте повторно</p>
                  {role === 'organizer' ? <form className="correction-form" onSubmit={resubmit}>
                    <label htmlFor="corrected-title">Исправленное название мероприятия</label>
                    <input ref={correctionInput} id="corrected-title" type="text" value={correctedTitle}
                      aria-invalid={correctionError ? true : undefined}
                      aria-describedby={correctionError ? 'correction-error' : undefined}
                      onChange={(event) => { setCorrectedTitle(event.target.value); setCorrectionError(null); }} />
                    {correctionError && <p id="correction-error" className="error" role="alert">{correctionError}</p>}
                    <button type="submit" className="primary">Отправить повторно</button>
                  </form> : <p className="helper-text">Исправления и повторную отправку выполняет организатор.</p>}
                </>}
              </div>
            </section>

            <section className="region preparation-region" aria-labelledby="preparation-heading">
              <div className="preparation-heading">
                <h2 id="preparation-heading">Подготовка мероприятия</h2>
                <p role="status" className={`badge ${isReady(selected) ? 'ready' : 'waiting'}`}>{isReady(selected) ? 'Готово' : 'Не готово'}</p>
              </div>
              <p className="remaining">Осталось обязательных задач: {remainingTasks(selected)}</p>
              {selected.status !== 'approved' && <p className="preparation-note">Подготовка доступна после согласования</p>}
              {selected.status === 'approved' && role === 'approver' && <p className="preparation-note">Задачи выполняет организатор. Здесь можно проверить готовность.</p>}
              <div className="progress-track" aria-hidden="true"><div className="progress-fill" style={{ transform: `scaleX(${(selected.tasks.length - remainingTasks(selected)) / selected.tasks.length})` }} /></div>
              <div className="task-list">
                {selected.tasks.map((task, index) => (
                  <label key={task.title} className={`task${task.done ? ' completed' : ''}${selected.status !== 'approved' || role !== 'organizer' ? ' disabled' : ''}`}>
                    <input type="checkbox" checked={task.done} disabled={selected.status !== 'approved' || role !== 'organizer'}
                      onChange={() => {
                        if (selected.status === 'approved' && role === 'organizer') changeApplication(toggleTask(selected, index, role));
                      }} />
                    <span>{task.title}</span>
                  </label>
                ))}
              </div>
              <p className="temporary-note">Временный список обязательных задач.</p>
            </section>
          </div>
        )}
      </div>
      <footer className="workspace-footer">Данные хранятся в этом браузере. Роли демонстрационные, отдельного входа нет.</footer>
    </main>
  );
}
