# Если проект перестал работать

Не пытайтесь чинить всё сразу. Сначала сохраните свою работу, затем перейдите на ближайшую контрольную точку.

## Вариант A. Через GitHub Desktop

1. Откройте проект в GitHub Desktop.
2. Если слева видны ваши изменения, выберите **Repository → Stash All Changes**.
3. Нажмите **Current Branch**.
4. Выберите нужную ветку из [`checkpoint-map.md`](checkpoint-map.md).
5. Откройте терминал из меню **Repository → Open in Terminal**.
6. Выполните:

```bash
npm ci
npm run workshop:check
```

7. Продолжайте с шага, указанного ведущим.

## Вариант B. Через терминал

Сначала посмотрите состояние:

```bash
git status
```

Если есть ваши изменения, временно сохраните их:

```bash
git stash push -u -m "my workshop work"
```

Обновите список веток и откройте нужную контрольную точку:

```bash
git fetch origin
git switch checkpoint/red
```

Если Git сообщает, что локальной ветки нет:

```bash
git switch --track origin/checkpoint/red
```

Замените `checkpoint/red` на ветку, которую назвал ведущий. Затем выполните:

```bash
npm ci
npm run workshop:check
```

## Как вернуть свои сохранённые изменения

Делайте это после воркшопа или вместе с ведущим:

```bash
git stash list
git stash pop
```

Если появились сообщения о конфликте, остановитесь и позовите ведущего. Не используйте `git reset --hard` и не удаляйте папку проекта.
