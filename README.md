# От идеи до релиза с AI - стартовый проект

Учебный шаблон для практического воркшопа Иннокентия Бодрова и Андрея Буракова.

## Подготовка

```bash
npm ci
npx playwright install chromium
npm run workshop:check
```

Успешный результат:

```text
READY FOR WORKSHOP
```

## Локальный запуск

```bash
npm run dev
```

## Учебные сценарии

- **S1:** создать событие с названием и будущей датой;
- **S2:** добавить задачу и отметить её выполненной;
- **S3:** увидеть понятные сообщения для пустой задачи, пустых полей события и даты в прошлом;
- **S4:** сохранить событие и задачи после обновления страницы.

Проверка сценариев:

```bash
npm run test:e2e
```

На ветках `main` и `checkpoint/red` эти проверки ожидаемо падают: продукт ещё не реализован. Это учебное состояние RED, а не ошибка подготовки.

## Контрольные точки

```bash
npm run checkpoint -- list
npm run checkpoint -- go red
npm run checkpoint -- go slice-1
npm run checkpoint -- go slice-2
npm run checkpoint -- go green
```

Команда `go` сначала сохраняет незавершённые изменения в `git stash`, затем переключает контрольную ветку. Чтобы вернуть сохранённые изменения:

```bash
npm run checkpoint -- recover
```

Маршрут не использует `git reset --hard` и не удаляет файлы участника.

## Публикация

Статический маршрут:

- build command: `npm run build`;
- output directory: `dist`.

Web service или контейнерный маршрут:

- build command: `npm run build`;
- start command: `npm run start`;
- health check: `/health`;
- port: переменная окружения `PORT`.

## Помощь

Используйте Issue Forms этого репозитория. Не публикуйте секреты.
