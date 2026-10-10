# Очередь действий — релиз 7cca7b6

Дата: 10.10.2026. Статус: **deployed, engineering verified, awaiting human UAT**.

## Разрешение и границы

Владелец поручил «реализовывать, доделывать и разворачивать» после выбора UI/UX
направления. Выбран code-led Operate «Очередь действий»; тот же публичный проект
и домен ВайбХостинг РФ, ceiling 0 ₽, без миграции данных и новых секретов.
MCP plan не требует повторного человеческого ввода confirmation; exact plan
confirmation передана инструменту в рамках существующего поручения владельца.

## Идентичность

- Source: `7cca7b6a86d4c04adaef2a60633229631b036256`.
- Branch: `codex/event-applications-release`.
- CI: https://github.com/InnokentyB/idea-to-release-ai-workshop-starter/actions/runs/38046388681 — success.
- Image: `ghcr.io/innokentyb/tech-analyst-club@sha256:f5767f6a5ee149320e976190d73b390157fb29a9f425d21dda60cd39313b8e6c`.
- Plan: `plan_aee572048937929c`, blockers `[]`.
- Operation: `op_7f95822428c4d10c`.
- Idempotency: `tech-analyst-club-7cca7b6-queue-update`.
- App: `tenant-4daea97d1379`, тот же аккаунт Tech Analyst Club.
- URL: https://p2.xn--80acbgye4ag1ak4a.xn--p1ai (p2.вайбхостинг.рф).
- Resources: 128 MB, 0.25 CPU, port 8080, `/health`.
- Предыдущий image: `ghcr.io/innokentyb/tech-analyst-club@sha256:46433ac18f8fc4eb4f46e794505470d40db8b88f238fdb497b632fd6140fa650`.

## Проверки

Локальные build, 36 production E2E, 4 server tests, workshop:check прошли;
npm audit --omit=dev: 0 vulnerabilities. CI повторил build/server/E2E перед
сборкой linux/amd64 контейнера. Anonymous GHCR manifest дал 200, SHA-256 тела
совпал с immutable digest, linux/amd64 подтверждён. Независимый дизайн-review:
ship после двух material fixes; DESIGN.md отражает построенную систему.

MCP deploy и независимый deployment_status подтвердили ready_for_owner_review,
deployment deployed, publicHealth healthy, uatVerdict null. Время ready:
2026-10-10T10:54:34.030Z. previousReleaseId совпадает с предыдущим проверенным
образом; rollback контракт сохраняет прежний immutable image и проверяет health.
Реальный rollback не запускался.

HTTPS `/health` 200 {status:ok}; главная 200 и seed d056bc38. JS
index-CwpRFTFW.js, CSS index-bvAp662C.css, локальный font golos-text-Ca6L06xr.ttf
и лицензия golos-text-OFL.txt загружаются с 200.

Из exact source SHA через git archive извлечены тесты; изолированная конфигурация
без локального webServer направлена на опубликованный HTTPS origin. **36 E2E
passed (21.7 s)**: реестр, поиск/фильтры, роли, возврат/исправление/повторное
решение, подготовка/готовность, reload, storage recovery, literal hostile input,
клавиатура и мобильное представление. Тесты не изменяли данные браузера владельца.

## Ограничения

Данные остаются в localStorage отдельного браузера и origin. Записи localhost
не переносятся; прежние записи того же опубликованного origin совместимы.
Роли демонстрационные, общей базы и настоящего входа нет. Четыре задачи временные.
Human UAT не выполнен, record_uat не вызывался. Срок пилотного аккаунта до
17.10.2026 10:36:36 UTC. Откат контейнера не откатывает browser storage.
