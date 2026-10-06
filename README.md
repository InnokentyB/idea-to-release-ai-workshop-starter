# От идеи до релиза с AI - стартовый проект

Учебный шаблон для практического воркшопа Иннокентия Бодрова и Андрея Буракова.

## Подготовка

```bash
npm ci
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

## Публикация

Статический маршрут:

- build command: `npm run build`;
- output directory: `dist`.

Web service или контейнерный маршрут:

- build command: `npm run build`;
- start command: `npm run start`;
- health check: `/health`;
- port: переменная окружения `PORT`.

## Проверка повторного выпуска

Замените `WORKSHOP READY` в `src/App.tsx` на `WORKSHOP READY - <ваше имя>`, сделайте commit и push, затем проверьте обновление по публичной ссылке.

## Помощь

Используйте Issue Forms этого репозитория. Не публикуйте секреты.
