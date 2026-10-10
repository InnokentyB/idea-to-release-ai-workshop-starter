import { expect, test } from "@playwright/test";
import { submitApplication } from "./helpers/event-application";

test("E2E-UX-01: selecting the current approver role preserves an unsent comment", async ({ page }) => {
  const { review } = await submitApplication(page, "Обсуждение программы");
  const comment = review.getByRole("textbox", { name: "Комментарий", exact: true });
  await comment.fill("Нужно уточнить формат выступлений");
  await page.getByRole("button", { name: "Согласующий", exact: true }).click();
  await expect(comment).toHaveValue("Нужно уточнить формат выступлений");
  await expect(review.getByRole("status")).toHaveText("На согласовании");
});

test("E2E-UX-02: rejected return focuses the comment needed to recover", async ({ page }) => {
  const { review, applicant } = await submitApplication(page);
  await review.getByRole("button", { name: "Вернуть на доработку", exact: true }).click();
  await expect(review.getByRole("alert")).toHaveText("Добавьте комментарий, чтобы вернуть заявку на доработку");
  await expect(review.getByRole("textbox", { name: "Комментарий", exact: true })).toBeFocused();
  await expect(applicant.getByRole("status")).toHaveText("На согласовании");
});

test("E2E-UX-03: list and detail navigation move focus to the destination heading", async ({ page }) => {
  await submitApplication(page, "Встреча по навигации");
  await page.getByRole("button", { name: "Все заявки", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Все заявки", exact: true })).toBeFocused();
  await page.getByRole("button", { name: "Открыть заявку Встреча по навигации", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Встреча по навигации", exact: true })).toBeFocused();
  await page.getByRole("button", { name: "Вернуться к списку", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Все заявки", exact: true })).toBeFocused();
});

test("E2E-UX-04: new application navigation focuses the title input", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Все заявки", exact: true }).click();
  await page.getByRole("button", { name: "Новая заявка", exact: true }).click();
  await expect(page.getByRole("textbox", { name: "Название мероприятия", exact: true })).toBeFocused();
});

test("E2E-UX-05: mobile overview and detail retain long content without horizontal overflow", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const title = "Межотделовая конференция по подготовке мероприятий и согласованию обязательных задач для участников клуба";
  const reason = "Уточните программу конференции, количество участников и ответственность за проверку оборудования до повторной подачи заявки.";
  const { review, applicant } = await submitApplication(page, title);
  await review.getByRole("textbox", { name: "Комментарий", exact: true }).fill(reason);
  await review.getByRole("button", { name: "Вернуть на доработку", exact: true }).click();
  await page.getByRole("button", { name: "Все заявки", exact: true }).click();
  const overview = page.getByRole("region", { name: "Все заявки", exact: true });
  const titleCell = overview.getByRole("rowheader").filter({ hasText: title });
  await expect(titleCell).toBeVisible();
  await expect(titleCell).toHaveText(title);
  await expect(overview.getByText(reason, { exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  await overview.getByRole("button", { name: `Открыть заявку ${title}`, exact: true }).click();
  await expect(page.getByRole("heading", { name: title, exact: true })).toBeVisible();
  await expect(applicant.getByText(reason, { exact: true })).toBeVisible();
  await expect(applicant.getByRole("status")).toHaveText("На доработке");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  await page.getByRole("button", { name: "Вернуться к списку", exact: true }).click();
  await expect(overview.getByText(reason, { exact: true })).toBeVisible();
});

// RED was independently observed manually: disappearing action controls left focus on BODY.
test("E2E-UX-06: disappearing action controls return keyboard focus to the application heading", async ({ page }) => {
  const { review, applicant } = await submitApplication(page, "Встреча для проверки фокуса");
  await page.getByRole("button", { name: "Организатор", exact: true }).click();
  await page.getByRole("button", { name: "Новая заявка", exact: true }).click();
  await expect(page.getByRole("textbox", { name: "Название мероприятия", exact: true })).toBeFocused();
  await page.getByRole("button", { name: "Отмена", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Встреча для проверки фокуса", exact: true })).toBeFocused();

  await page.getByRole("button", { name: "Согласующий", exact: true }).click();
  await review.getByRole("textbox", { name: "Комментарий", exact: true }).fill("Уточните название встречи");
  await review.getByRole("button", { name: "Вернуть на доработку", exact: true }).click();
  await expect(applicant.getByRole("status")).toHaveText("На доработке");
  await expect(page.getByRole("heading", { name: "Встреча для проверки фокуса", exact: true })).toBeFocused();

  await page.getByRole("button", { name: "Организатор", exact: true }).click();
  await applicant.getByRole("textbox", { name: "Исправленное название мероприятия", exact: true }).fill("Уточнённая встреча для проверки фокуса");
  await applicant.getByRole("button", { name: "Отправить повторно", exact: true }).click();
  await expect(applicant.getByRole("status")).toHaveText("На согласовании");
  await expect(page.getByRole("heading", { name: "Уточнённая встреча для проверки фокуса", exact: true })).toBeFocused();

  await page.getByRole("button", { name: "Согласующий", exact: true }).click();
  await review.getByRole("button", { name: "Согласовать", exact: true }).click();
  await expect(applicant.getByRole("status")).toHaveText("Согласовано");
  await expect(page.getByRole("heading", { name: "Уточнённая встреча для проверки фокуса", exact: true })).toBeFocused();
});
