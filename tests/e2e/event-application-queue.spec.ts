import { expect, test, type Page } from "@playwright/test";
import { applicationActionName, applicationActions, mandatoryTasks, submitApplication } from "./helpers/event-application";

const overview = (page: Page) => page.getByRole("region", { name: "Все заявки", exact: true });
const filters = (page: Page) => page.getByRole("group", { name: "Фильтр заявок", exact: true });
const row = (page: Page, title: string) => overview(page).getByRole("row").filter({ has: page.getByRole("button", { name: applicationActionName(title) }) });

async function createQueue(page: Page) {
  await submitApplication(page, "Ожидающий семинар");
  const returned = await submitApplication(page, "Возвращённая встреча");
  await returned.review.getByRole("textbox", { name: "Комментарий", exact: true }).fill("Уточните программу");
  await returned.review.getByRole("button", { name: "Вернуть на доработку", exact: true }).click();
  const partial = await submitApplication(page, "Подготовка конференции");
  await partial.review.getByRole("button", { name: "Согласовать", exact: true }).click();
  await page.getByRole("button", { name: "Организатор", exact: true }).click();
  await partial.preparation.getByRole("checkbox", { name: mandatoryTasks[0], exact: true }).check();
  const ready = await submitApplication(page, "Готовая конференция");
  await ready.review.getByRole("button", { name: "Согласовать", exact: true }).click();
  await page.getByRole("button", { name: "Организатор", exact: true }).click();
  for (const title of mandatoryTasks) await ready.preparation.getByRole("checkbox", { name: title, exact: true }).check();
  await page.getByRole("button", { name: "Все заявки", exact: true }).click();
}

test("E2E-QUEUE-01: first visit and reload land on registry without an automatic submission form", async ({ page }) => {
  await page.goto("/");
  await expect(overview(page)).toBeVisible();
  await expect(overview(page).getByText("Заявок пока нет", { exact: true })).toBeVisible();
  await expect(page.getByRole("textbox", { name: "Название мероприятия", exact: true })).toHaveCount(0);
  await submitApplication(page, "Сохранённое мероприятие");
  await page.reload();
  await expect(overview(page)).toBeVisible();
  await expect(row(page, "Сохранённое мероприятие")).toBeVisible();
  await expect(page.getByRole("textbox", { name: "Название мероприятия", exact: true })).toHaveCount(0);
  await expect(page.getByRole("region", { name: "Состояние заявки", exact: true })).toHaveCount(0);
});

test("E2E-QUEUE-02: title search ignores case and surrounding spaces with an explicit empty-result recovery", async ({ page }) => {
  await submitApplication(page, "Семинар команды");
  await submitApplication(page, "Встреча отдела");
  await page.getByRole("button", { name: "Организатор", exact: true }).click();
  await page.getByRole("button", { name: "Все заявки", exact: true }).click();
  const search = overview(page).getByRole("textbox", { name: "Найти мероприятие", exact: true });
  await expect(search).toBeVisible();
  await search.fill("  СЕМИНАР  ");
  await expect(row(page, "Семинар команды")).toBeVisible();
  await expect(row(page, "Встреча отдела")).toHaveCount(0);
  await search.fill("Несуществующее мероприятие");
  await expect(overview(page).getByText("Заявки не найдены", { exact: true })).toBeVisible();
  await expect(overview(page).getByText("Заявок пока нет", { exact: true })).toHaveCount(0);
  await overview(page).getByRole("button", { name: "Сбросить фильтры", exact: true }).click();
  await expect(search).toHaveValue("");
  await expect(row(page, "Семинар команды")).toBeVisible();
  await expect(row(page, "Встреча отдела")).toBeVisible();
});

test("E2E-QUEUE-03: status filters separate approved preparation from complete readiness and expose next actions", async ({ page }) => {
  await createQueue(page);
  await expect(filters(page)).toBeVisible();
  for (const [filter, title, action] of [
    ["На согласовании", "Ожидающий семинар", "Открыть"],
    ["На доработке", "Возвращённая встреча", "Исправить заявку"],
    ["Подготовка", "Подготовка конференции", "Продолжить подготовку"],
    ["Готово", "Готовая конференция", "Открыть"],
  ]) {
    const filterButton = filters(page).getByRole("button", { name: filter, exact: true });
    await filterButton.click();
    await expect(filterButton).toHaveAttribute("aria-pressed", "true");
    await expect(overview(page).getByRole("button", { name: applicationActions })).toHaveCount(1);
    await expect(row(page, title)).toBeVisible();
    await expect(row(page, title).getByRole("button", { name: applicationActionName(title) })).toHaveText(action);
  }
  await filters(page).getByRole("button", { name: "Все", exact: true }).click();
  await expect(overview(page).getByRole("button", { name: applicationActions })).toHaveCount(4);
  await expect(row(page, "Подготовка конференции")).toContainText("Осталось: 3 из 4");
  await expect(row(page, "Подготовка конференции").getByText("Не готово", { exact: true })).toBeVisible();
  await expect(row(page, "Готовая конференция")).toContainText("Осталось: 0 из 4");
  await expect(row(page, "Готовая конференция").getByText("Готово", { exact: true })).toBeVisible();
});

test("E2E-QUEUE-04: approver queue starts pending and organizer returns to all without interrupting detail", async ({ page }) => {
  await createQueue(page);
  await page.getByRole("button", { name: "Согласующий", exact: true }).click();
  await expect(filters(page).getByRole("button", { name: "На согласовании", exact: true })).toHaveAttribute("aria-pressed", "true");
  await expect(overview(page).getByRole("button", { name: applicationActions })).toHaveCount(1);
  const openPending = row(page, "Ожидающий семинар").getByRole("button", { name: applicationActionName("Ожидающий семинар") });
  await expect(openPending).toHaveText("Рассмотреть заявку");
  await filters(page).getByRole("button", { name: "Все", exact: true }).click();
  await expect(overview(page).getByRole("button", { name: applicationActions })).toHaveCount(4);
  await openPending.click();
  await page.getByRole("button", { name: "Организатор", exact: true }).click();
  await expect(page.getByRole("region", { name: "Состояние заявки", exact: true })).toBeVisible();
  await expect(overview(page)).toHaveCount(0);
  await page.getByRole("button", { name: "Вернуться к списку", exact: true }).click();
  await expect(filters(page).getByRole("button", { name: "Все", exact: true })).toHaveAttribute("aria-pressed", "true");
  await expect(overview(page).getByRole("button", { name: applicationActions })).toHaveCount(4);
});

// Reviewer reproduced RED manually: the old aria-label omitted visible next actions.
test("E2E-QUEUE-05: accessible row names include their visible next actions", async ({ page }) => {
  await createQueue(page);
  const correction = overview(page).getByRole("button", { name: "Исправить заявку Возвращённая встреча", exact: true });
  await expect(correction).toBeVisible();
  await expect(correction).toHaveText("Исправить заявку");
  const preparation = overview(page).getByRole("button", { name: "Продолжить подготовку Подготовка конференции", exact: true });
  await expect(preparation).toBeVisible();
  await expect(preparation).toHaveText("Продолжить подготовку");
  await page.getByRole("button", { name: "Согласующий", exact: true }).click();
  const review = overview(page).getByRole("button", { name: "Рассмотреть заявку Ожидающий семинар", exact: true });
  await expect(review).toBeVisible();
  await expect(review).toHaveText("Рассмотреть заявку");
});
