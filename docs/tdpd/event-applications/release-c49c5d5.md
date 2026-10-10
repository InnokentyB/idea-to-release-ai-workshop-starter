# Первая живая выкатка — c49c5d5

Дата: 2026-10-10, 11:38 Europe/Lisbon (10:38 UTC).
Статус: **deployed, engineering verified, awaiting human UAT**.

## Источник и разрешение

DEP-S006: владелец в этом чате передал одноразовое приглашение и поручил «разворачивай». Приглашение использовано только для `create_account`; его значение и токен здесь не записаны. DEP-DL004: выполнить первую выкатку ранее подготовленной release-ветки в новом аккаунте. Критерий: опубликовать проверенный прототип в отдельном контейнере без изменения существующих проектов.

## Идентичность релиза

- Репозиторий: https://github.com/InnokentyB/idea-to-release-ai-workshop-starter
- Ветка: `codex/event-applications-release`.
- Source commit: `c49c5d5772d5bb9d2a8129d976edb83a01f6c075`.
- Image: `ghcr.io/innokentyb/tech-analyst-club@sha256:46433ac18f8fc4eb4f46e794505470d40db8b88f238fdb497b632fd6140fa650`.
- GitHub Actions: https://github.com/InnokentyB/idea-to-release-ai-workshop-starter/actions/runs/38045471552 — success.
- Новый аккаунт: Tech Analyst Club, `account_60c1d1775383936638d4ae91`.
- App ID: `tenant-4daea97d1379`.
- MCP plan: `plan_98b799231fea16d3`.
- Operation: `op_1cdbe03d5e399345`.
- Idempotency key: `tech-analyst-club-c49c5d5-first-deploy`.
- Адрес: https://p2.xn--80acbgye4ag1ak4a.xn--p1ai (p2.вайбхостинг.рф).
- Порт контейнера 8080; health `/health`; 128 МБ, 0,25 CPU; pilot price ceiling 0 ₽.

## Доказательства

1. Официальный локальный MCP-мост зарегистрировал отдельный аккаунт; credential сохранён вне репозитория с правами 0600. `get_account` подтвердил active. Повторного потребления приглашения не было.
2. GitHub Actions выполнил npm ci, production build и **31 e2e**, затем собрал linux/amd64 Docker-образ и отправил его в GHCR. Изменяющаяся рабочая копия в сборку не входила.
3. GitHub Packages показывает Public. Anonymous GHCR manifest GET дал 200; SHA-256 полученных байтов совпал с image digest. OCI index содержит linux/amd64 и provenance attestation.
4. MCP `register_project` → `plan_deployment`: blockers `[]`; source SHA, image digest и отдельный target совпали. `deploy_project` и повторный `deployment_status` дали `ready_for_owner_review`, deployment `deployed`, publicHealth `healthy`, uatVerdict `null`.
5. Живой HTTPS `/health` дал 200 и `{"status":"ok"}`. Главная страница, JS `index-jPqxnGZI.js` и CSS `index-DBxjyIF9.css` дали 200 с правильными content types.
6. Тесты извлечены через `git archive` из указанного source SHA. Изолированный Playwright config использовал опубликованный HTTPS origin без локального сервера. Полный набор релиза: **31 passed, 22.1 s**. Проверены подача, роли, возврат с обязательным комментарием, исправление, согласование, подготовка, readiness, reload, ошибки storage, безопасный текст, мобильный экран и фокус.

Трассируемость: DEP-S001/006 → DEP-DL001–004 → manifest/Dockerfile/CI → source SHA/image digest → MCP plan/operation → live health + 31 E2E → human UAT pending.

## Ограничения и восстановление

Опубликован локальный браузерный прототип: localStorage одного origin, демонстрационные роли, без реального входа или совместной базы. Записи с localhost или другого домена автоматически сюда не переносятся. Изменения UI, которые идут после c49c5d5, в этот релиз не входят.

Human UAT не выполнялся и `record_uat` не вызывался. Первая выкатка не имеет предыдущего образа этого приложения; откат не проверялся. Для следующего релиза сохранить этот digest как предыдущий и проверить актуальный контракт rollback. Деплой не мигрирует и не откатывает browser storage.

Прежние блокеры приглашения и отсутствия образа в `deployment.md` описывают подготовку до этой выкатки; для c49c5d5 они закрыты доказательствами выше.
