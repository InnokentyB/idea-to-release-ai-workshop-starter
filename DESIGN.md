---
name: "Заявки на мероприятия"
description: "Тёплая рабочая система для согласования и подготовки мероприятий"
colors:
  forest: "#426849"
  forest-hover: "#325338"
  graphite: "#252923"
  muted: "#62675e"
  paper: "#faf9f5"
  surface: "#fdfdfa"
  preparation: "#f6f7f1"
  line: "#d8dbd2"
  control-hover: "#edf0e8"
  role-selected: "#e4ece0"
  role-text: "#2f5036"
  field-border: "#aab3a4"
  secondary-border: "#a3ad9e"
  pending-text: "#50574b"
  returned-text: "#805719"
  returned-bg: "#f5e9d2"
  approved-text: "#355c3d"
  approved-bg: "#e3edde"
  waiting-bg: "#f0f1eb"
  white: "#ffffff"
typography:
  display:
    fontFamily: "\"Golos Text\", ui-sans-serif, system-ui, sans-serif"
    fontSize: "2rem"
    fontWeight: 650
    lineHeight: 1.3
    letterSpacing: "-.025em"
  headline:
    fontFamily: "\"Golos Text\", ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.625rem"
    fontWeight: 650
    lineHeight: 1.3
    letterSpacing: "-.02em"
  product-title:
    fontFamily: "\"Golos Text\", ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.375rem"
    fontWeight: 650
    lineHeight: 1.3
    letterSpacing: "-.025em"
  section-title:
    fontFamily: "\"Golos Text\", ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 650
    lineHeight: 1.3
  body:
    fontFamily: "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, \"Segoe UI\", sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
  control:
    fontFamily: "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, \"Segoe UI\", sans-serif"
    fontSize: ".9375rem"
    fontWeight: 600
    lineHeight: 1.4
  label:
    fontFamily: "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, \"Segoe UI\", sans-serif"
    fontSize: ".8125rem"
    fontWeight: 600
    lineHeight: 1.4
  annotation:
    fontFamily: "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, \"Segoe UI\", sans-serif"
    fontSize: ".75rem"
    fontWeight: 400
rounded:
  badge: "4px"
  control: "6px"
  surface: "8px"
spacing:
  step-8: "8px"
  step-12: "12px"
  step-16: "16px"
  step-20: "20px"
  step-24: "24px"
  step-28: "28px"
  step-32: "32px"
  step-40: "40px"
components:
  button-primary:
    backgroundColor: "{colors.forest}"
    textColor: "{colors.white}"
    rounded: "{rounded.control}"
    typography: "{typography.control}"
    padding: "11px 18px"
  button-primary-hover:
    backgroundColor: "{colors.forest-hover}"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.graphite}"
    rounded: "{rounded.control}"
    typography: "{typography.control}"
    padding: "11px 18px"
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.graphite}"
    rounded: "{rounded.control}"
    padding: "12px 14px"
  badge-returned:
    backgroundColor: "{colors.returned-bg}"
    textColor: "{colors.returned-text}"
    rounded: "{rounded.badge}"
    typography: "{typography.label}"
    padding: "5px 10px"
  queue-row:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.surface}"
    padding: "24px"
---
# Design System: Заявки на мероприятия

## Overview

**Creative North Star: "Очередь действий"**

Тёплая бумага, графитовый текст и лесной зелёный создают спокойную рабочую среду. Умеренная плотность, ясная типографическая иерархия и тонкие границы удерживают внимание на состоянии и доступном действии.

Система записана по реализованным src/App.tsx и src/styles.css и проверенным видам очереди и карточки на широком и узком экранах. Это code-led направление «Очередь действий», выбранное по делегированному решению; макет служил ориентиром для критики, а не утверждённой композицией. Локальный прототип хранит данные в localStorage текущего браузера; роли демонстрационные, без отдельного входа, общей базы и синхронизации.

**Key Characteristics:**
- Тёплые нейтральные поверхности и сдержанный лесной акцент.
- Локальный Golos Text для заголовков с кириллицей, системный шрифт для чтения и управления.
- Плоские поверхности, мягкие углы и полное содержание на мобильном экране.

## Colors

Палитра тёплая и малонасыщенная; фронтматтер содержит нормативные значения из реализации.

### Primary
- **Лесной зелёный** (`forest`, `forest-hover`): основные действия, активный фильтр, фокус, caret и прогресс.
- **Светлый лес** (`role-selected`, `role-text`, `approved-bg`, `approved-text`): выбранная роль и позитивные состояния. Метка готовности не заменяет решение согласующего.

### Secondary
- **Тёплая охра** (`returned-bg`, `returned-text`): возврат на доработку; внимание к исправлению, без окрашивания всей заявки.

### Neutral
- **Тёплая бумага** (`paper`, `surface`, `preparation`): фон, рабочая поверхность и мягко отделённая подготовка.
- **Графит и приглушённый серо-зелёный** (`graphite`, `muted`, `pending-text`): основной текст, пояснения, ожидание и счётчики.
- **Тонкие линии** (`line`, `field-border`, `secondary-border`): разделы и границы полей/кнопок.
- **Нейтральные состояния** (`control-hover`, `waiting-bg`): hover и ещё не достигнутая готовность; `white` — надписи на основных кнопках.

**The Text With State Rule.** Цвет сопровождает текст состояния; решение и готовность имеют отдельные метки.

## Typography

**Display Font:** локальный Golos Text с ui-sans-serif/system-ui fallback.
**Body Font:** системный ui-sans-serif стек из фронтматтера.

Golos Text поставляется локальным variable TTF (400–900, font-display: swap) и поддерживает кириллические заголовки. Управление и длинный текст остаются привычными системными формами.

### Hierarchy
- **Display:** заголовок рабочего раздела, на телефоне уменьшается до 1.625rem.
- **Headline:** название выбранной заявки; на телефоне 1.375rem.
- **Product title:** имя продукта; на телефоне 1.25rem.
- **Section title:** подготовка; обычные h3 — 1rem, вес 600.
- **Body:** основной текст и поля; подписи действий — роль `control`, вспомогательный текст — .875rem.
- **Label / annotation:** состояния, счётчики, подписи комментария и локальные ограничения. Числовые счётчики используют tabular-nums.
- Название в строке очереди — системный шрифт (1.25rem, 650, line-height 1.35), на телефоне 1.125rem. Это строковый заголовок таблицы, а не h1–h3.
- Комментарии и текст пустого состояния ограничены шириной 65ch там, где это задано реализацией.

**The Cyrillic Heading Rule.** Заголовки используют локальный Golos Text; системный стек остаётся для текста и управления.

## Layout

Оболочка ограничена 1440px, центрирована, с отступами 24px 40px 32px. Рабочая карточка и новая заявка ограничены 880px. Основной ритм — повторяемые шаги из фронтматтера; важные разделы отделены 24–32px и тонкой линией.

Очередь — локальное выражение этого мира, описанное в `.impeccable/surfaces/src-app-tsx.md`: роли, фильтры, поиск по названию, полные строки заявок. На широком экране строка имеет четыре колонки; при 1200px сетка уплотняется, при 900px перестраивается в две колонки с отдельными рядами названия, решения, задач и действия. При 600px внешние отступы становятся 20px 16px 28px, поиск и счётчик идут друг под другом, кнопки решения и отправки растягиваются по ширине. Фильтры допускают горизонтальную прокрутку своей полосы; содержание страницы не обрезается.

## Elevation & Depth

Тени отсутствуют. Близкие бумажные тона, границы и интервалы разделяют очередь, согласование и подготовку. Ни hover, ни focus не поднимают поверхность.

**The Flat Surface Rule.** Глубина передаётся тоном, границами и расстоянием, без теней.

## Shapes

Радиусы следуют трём ролям из фронтматтера: компактная метка, контроль, рабочая поверхность. Линии толщиной 1px, активный фильтр подчёркнут линией 2px. Нет круглых кнопок, декоративных иконок или иллюстраций; текст несёт смысл управления.

## Components

### Buttons
Основное действие — лесная заливка, белая надпись, мягкие углы; вторичное — прозрачная поверхность с границей. Минимальная высота 44px, в строке очереди 46px. Hover основного действия темнее, вторичного — мягкий нейтральный тон. Ссылочные кнопки подчёркнуты с отступом 4px и имеют высоту 44px. Глобальный focus-visible — лесной outline 3px с offset 4px.

### Navigation
Роли — сегментированный контроль с aria-pressed и видимой выбранной заливкой (40px высота, 44px на телефоне). Фильтры — текстовая полоса (48px), выбранный элемент обозначен весом и подчёркиванием, а также aria-pressed. Переход к списку/карточке и открытие формы переводят фокус на соответствующий заголовок/поле.

### Chips
Статусы — компактные текстовые метки, не интерактивные chips. Ожидание нейтрально, возврат охристый, согласование и готовность зелёные. Готовность вычисляется из состояния заявки и обязательных задач.

### Cards / Containers
Строки очереди и карточка разделены границей, без тени. Строка имеет 24px внутренних отступов на широком экране, 20px на телефоне. Согласование и подготовка находятся в одной карточке; подготовка отличается тоном и верхней линией.

### Inputs / Fields
Светлая поверхность, различимая граница, минимальная высота 46px. Textarea высотой от 104px растягивается вертикально. Подписи явные; поиск имеет скрытую доступную подпись. Ошибки связаны через aria-describedby и aria-invalid, выводятся как alert; ошибка возврата направляет фокус в комментарий. Ошибка хранения отдельно сообщает, что изменения не сохранены; повреждённые исходные данные не перезаписываются.

### Queue action and preparation
Одно действие строки отражает текущую роль и состояние: рассмотрение, исправление, подготовка либо открытие. Доступное имя кнопки включает действие и название заявки. Согласующий при переключении получает фильтр ожидающих решения, организатор — все заявки; поиск сравнивает названия без учёта регистра. Пустая база и пустая выдача имеют разные сообщения.

Повторная отправка исправляет ту же заявку с тем же id и сохраняет последний комментарий возврата. Возврат требует содержательного комментария; задачи доступны организатору после согласования. Нативные checkbox (20px) сопровождаются полным текстом; завершённый текст зачёркнут. Прогресс (3px) — вспомогательный, aria-hidden, с переходом transform 220ms cubic-bezier(.16, 1, .3, 1); reduced-motion отключает его. Четыре задачи временные, это отмечено рядом со списком.

## Do's and Don'ts

### Do:
- **Do** сохранять ясный текст действия и видимый клавиатурный фокус.
- **Do** разделять состояние решения и вычисленную готовность текстовыми метками.
- **Do** переносить длинные названия и сохранять весь комментарий, включая переводы строк.
- **Do** явно обозначать локальное хранение, демонстрационные роли и временный список задач.

### Don't:
- **Don't** обозначать состояние только цветом.
- **Don't** заменять локальный Golos Text системным шрифтом в заголовках.
- **Don't** скрывать содержание заявки при мобильной перестройке.
- **Don't** добавлять декоративные тени или анимацию появления в эту плоскую рабочую систему.
