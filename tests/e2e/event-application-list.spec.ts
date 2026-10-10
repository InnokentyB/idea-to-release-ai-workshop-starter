import { expect, test, type Page } from "@playwright/test";
import { mandatoryTasks, submitApplication } from "./helpers/event-application";

async function openOverview(page: Page) {
  const action = page.getByRole("button", { name: "Все заявки", exact: true });
  await expect(action, "Организатор может открыть полный список заявок").toBeVisible();
  await action.click();
  const overview = page.getByRole("region", { name: "Все заявки", exact: true });
  await expect(overview).toBeVisible();
  return overview;
}

function rowFor(page: Page, title: string) {
  return page.getByRole("table", { name: "Список заявок", exact: true })
    .getByRole("row").filter({ has: page.getByRole("button", { name: `Открыть заявку ${title}`, exact: true }) });
}

test("E2E-LIST-01: empty overview explains that no applications exist", async ({ page }) => {
  await page.goto("/");
  const overview = await openOverview(page);
  await expect(overview.getByText("Заявок пока нет", { exact: true })).toBeVisible();
  await expect(overview.getByRole("button", { name: /^Открыть заявку / })).toHaveCount(0);
});

test("E2E-LIST-02: all applications show decisions, remaining tasks and distinct readiness", async ({ page }) => {
  await submitApplication(page, "Ожидающая встреча");
  const returned = await submitApplication(page, "Возвращённый семинар");
  await returned.review.getByRole("textbox", { name: "Комментарий", exact: true }).fill("Уточните программу семинара");
  await returned.review.getByRole("button", { name: "Вернуть на доработку", exact: true }).click();
  const approved = await submitApplication(page, "Согласованная конференция");
  await approved.review.getByRole("button", { name: "Согласовать", exact: true }).click();
  await page.getByRole("button", { name: "Организатор", exact: true }).click();
  await approved.preparation.getByRole("checkbox", { name: mandatoryTasks[0], exact: true }).check();

  const overview = await openOverview(page);
  const table = overview.getByRole("table", { name: "Список заявок", exact: true });
  await expect(table.getByRole("row")).toHaveCount(4);
  for (const heading of ["Мероприятие", "Состояние заявки", "Решение", "Обязательные задачи", "Готовность"]) {
    await expect(table.getByRole("columnheader", { name: heading, exact: true })).toBeVisible();
  }
  const pendingRow = rowFor(page, "Ожидающая встреча");
  await expect(pendingRow.getByText("На согласовании", { exact: true })).toBeVisible();
  await expect(pendingRow.getByText("Ожидает решения", { exact: true })).toBeVisible();
  await expect(pendingRow.getByText("Осталось: 4 из 4", { exact: true })).toBeVisible();
  await expect(pendingRow.getByText("Не готово", { exact: true })).toBeVisible();
  const returnedRow = rowFor(page, "Возвращённый семинар");
  await expect(returnedRow.getByText("На доработке", { exact: true })).toBeVisible();
  await expect(returnedRow).toContainText("Уточните программу семинара");
  await expect(returnedRow.getByText("Осталось: 4 из 4", { exact: true })).toBeVisible();
  await expect(returnedRow.getByText("Не готово", { exact: true })).toBeVisible();
  const approvedRow = rowFor(page, "Согласованная конференция");
  await expect(approvedRow.getByText("Согласовано", { exact: true }).first()).toBeVisible();
  await expect(approvedRow.getByText("Осталось: 3 из 4", { exact: true })).toBeVisible();
  await expect(approvedRow.getByText("Не готово", { exact: true })).toBeVisible();
});

test("E2E-LIST-03: organizer corrects a listed application and approver decides through the same list", async ({ page }) => {
  const { review, applicant } = await submitApplication(page, "Исходное мероприятие");
  await review.getByRole("textbox", { name: "Комментарий", exact: true }).fill("Уточните название");
  await review.getByRole("button", { name: "Вернуть на доработку", exact: true }).click();
  await page.getByRole("button", { name: "Организатор", exact: true }).click();
  await openOverview(page);
  await rowFor(page, "Исходное мероприятие").getByRole("button", { name: "Открыть заявку Исходное мероприятие", exact: true }).click();
  await expect(page.getByRole("button", { name: "Организатор", exact: true })).toHaveAttribute("aria-pressed", "true");
  await applicant.getByRole("textbox", { name: "Исправленное название мероприятия", exact: true }).fill("Исправленное мероприятие");
  await applicant.getByRole("button", { name: "Отправить повторно", exact: true }).click();
  await page.getByRole("button", { name: "Вернуться к списку", exact: true }).click();
  await expect(page.getByRole("table", { name: "Список заявок", exact: true }).getByRole("row")).toHaveCount(2);
  await expect(rowFor(page, "Исправленное мероприятие").getByText("На согласовании", { exact: true })).toBeVisible();
  await expect(rowFor(page, "Исходное мероприятие")).toHaveCount(0);
  await page.getByRole("button", { name: "Согласующий", exact: true }).click();
  await rowFor(page, "Исправленное мероприятие").getByRole("button", { name: "Открыть заявку Исправленное мероприятие", exact: true }).click();
  await expect(page.getByRole("button", { name: "Согласующий", exact: true })).toHaveAttribute("aria-pressed", "true");
  await review.getByRole("button", { name: "Согласовать", exact: true }).click();
  await page.getByRole("button", { name: "Вернуться к списку", exact: true }).click();
  await expect(rowFor(page, "Исправленное мероприятие").getByText("Согласовано", { exact: true }).first()).toBeVisible();
  await expect(rowFor(page, "Исправленное мероприятие").getByText("Не готово", { exact: true })).toBeVisible();
});

test("E2E-LIST-04: completed preparation and the entire list survive reload", async ({ page }) => {
  await submitApplication(page, "Другая заявка");
  const { review, preparation } = await submitApplication(page, "Готовое мероприятие");
  await review.getByRole("button", { name: "Согласовать", exact: true }).click();
  await page.getByRole("button", { name: "Организатор", exact: true }).click();
  for (const title of mandatoryTasks) await preparation.getByRole("checkbox", { name: title, exact: true }).check();
  await openOverview(page);
  await expect(rowFor(page, "Готовое мероприятие").getByText("Готово", { exact: true })).toBeVisible();
  await expect(rowFor(page, "Готовое мероприятие").getByText("Осталось: 0 из 4", { exact: true })).toBeVisible();
  await page.reload();
  await openOverview(page);
  await expect(page.getByRole("table", { name: "Список заявок", exact: true }).getByRole("row")).toHaveCount(3);
  await expect(rowFor(page, "Готовое мероприятие").getByText("Готово", { exact: true })).toBeVisible();
  await expect(rowFor(page, "Готовое мероприятие").getByText("Осталось: 0 из 4", { exact: true })).toBeVisible();
  await expect(rowFor(page, "Другая заявка").getByText("На согласовании", { exact: true })).toBeVisible();
});
