import { expect, test, type Page } from "@playwright/test";
import { mandatoryTasks } from "./helpers/event-application";

async function createAsOrganizer(page: Page, title = "Рабочая встреча") {
  await page.goto("/");
  await expect(page.getByRole("button", { name: "Организатор", exact: true })).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("textbox", { name: "Название мероприятия", exact: true }).fill(title);
  await page.getByRole("button", { name: "Подать заявку", exact: true }).click();
  return {
    review: page.getByRole("region", { name: "Согласование заявки", exact: true }),
    applicant: page.getByRole("region", { name: "Состояние заявки", exact: true }),
    preparation: page.getByRole("region", { name: "Подготовка мероприятия", exact: true }),
  };
}

async function switchRole(page: Page, role: "Организатор" | "Согласующий") {
  const button = page.getByRole("button", { name: role, exact: true });
  await button.click();
  await expect(button).toHaveAttribute("aria-pressed", "true");
}

async function returnForRevision(page: Page, comment = "Уточните название") {
  const regions = await createAsOrganizer(page);
  await switchRole(page, "Согласующий");
  await regions.review.getByRole("textbox", { name: "Комментарий", exact: true }).fill(comment);
  await regions.review.getByRole("button", { name: "Вернуть на доработку", exact: true }).click();
  await expect(regions.applicant.getByRole("status")).toHaveText("На доработке");
  await expect(regions.applicant.getByRole("button", { name: "Отправить повторно", exact: true })).toHaveCount(0);
  await expect(regions.applicant.getByRole("textbox", { name: "Исправленное название мероприятия", exact: true })).toHaveCount(0);
  return regions;
}

test("E2E-ROLE-01: organizer submits and sees state without decision controls", async ({ page }) => {
  const { review, applicant, preparation } = await createAsOrganizer(page);
  await expect(review.getByRole("status")).toHaveText("На согласовании");
  await expect(applicant.getByRole("status")).toHaveText("На согласовании");
  await expect(review.getByRole("button", { name: "Согласовать", exact: true })).toHaveCount(0);
  await expect(review.getByRole("button", { name: "Вернуть на доработку", exact: true })).toHaveCount(0);
  for (const title of mandatoryTasks) await expect(preparation.getByRole("checkbox", { name: title, exact: true })).toBeDisabled();
});

test("E2E-ROLE-02: approver decides but cannot submit or change approved preparation", async ({ page }) => {
  const { review, preparation } = await createAsOrganizer(page);
  await switchRole(page, "Согласующий");
  await expect(page.getByRole("button", { name: "Подать заявку", exact: true })).toHaveCount(0);
  await expect(page.getByRole("textbox", { name: "Название мероприятия", exact: true })).toHaveCount(0);
  await review.getByRole("button", { name: "Согласовать", exact: true }).click();
  await expect(review.getByRole("status")).toHaveText("Согласовано");
  for (const title of mandatoryTasks) {
    await expect(preparation.getByRole("checkbox", { name: title, exact: true })).toBeDisabled();
    await expect(preparation.getByRole("checkbox", { name: title, exact: true })).not.toBeChecked();
  }
  await switchRole(page, "Организатор");
  await preparation.getByRole("checkbox", { name: mandatoryTasks[0], exact: true }).check();
  await switchRole(page, "Согласующий");
  await expect(preparation.getByRole("checkbox", { name: mandatoryTasks[0], exact: true })).toBeChecked();
  await expect(preparation.getByRole("checkbox", { name: mandatoryTasks[0], exact: true })).toBeDisabled();
});

test("E2E-REV-01: correction resubmits the same application, retains history and requires another decision", async ({ page }) => {
  const comment = "Уточните название";
  const { review, applicant, preparation } = await returnForRevision(page, comment);
  const initialIds = await page.evaluate(() => JSON.parse(localStorage.getItem("event-applications-v1")!).map((application: { id: string }) => application.id));
  await switchRole(page, "Организатор");
  await applicant.getByRole("textbox", { name: "Исправленное название мероприятия", exact: true }).fill("Уточнённая рабочая встреча");
  await applicant.getByRole("button", { name: "Отправить повторно", exact: true }).click();
  await expect(applicant.getByRole("status")).toHaveText("На согласовании");
  await expect(applicant.getByText("Уточнённая рабочая встреча", { exact: true })).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Заявки", exact: true }).getByRole("button")).toHaveCount(1);
  const revisedIds = await page.evaluate(() => JSON.parse(localStorage.getItem("event-applications-v1")!).map((application: { id: string }) => application.id));
  expect(revisedIds).toEqual(initialIds);
  await expect(page.getByText(comment, { exact: true }).first()).toBeVisible();
  for (const title of mandatoryTasks) await expect(preparation.getByRole("checkbox", { name: title, exact: true })).toBeDisabled();
  await switchRole(page, "Согласующий");
  await review.getByRole("button", { name: "Согласовать", exact: true }).click();
  await switchRole(page, "Организатор");
  await expect(applicant.getByRole("status")).toHaveText("Согласовано");
  for (const title of mandatoryTasks) await expect(preparation.getByRole("checkbox", { name: title, exact: true })).toBeEnabled();
  await expect(page.getByText(comment, { exact: true }).first()).toBeVisible();
  await page.reload();
  await expect(applicant.getByRole("status")).toHaveText("Согласовано");
  await expect(page.getByText(comment, { exact: true }).first()).toBeVisible();
});

test("E2E-REV-02: returned application survives reload and blank correction cannot resubmit", async ({ page }) => {
  const { applicant } = await returnForRevision(page);
  await page.reload();
  await expect(page.getByRole("button", { name: "Организатор", exact: true })).toHaveAttribute("aria-pressed", "true");
  await expect(applicant.getByRole("status")).toHaveText("На доработке");
  await applicant.getByRole("textbox", { name: "Исправленное название мероприятия", exact: true }).fill("   ");
  await applicant.getByRole("button", { name: "Отправить повторно", exact: true }).click();
  await expect(applicant.getByRole("alert")).toBeVisible();
  await expect(applicant.getByRole("status")).toHaveText("На доработке");
  await applicant.getByRole("textbox", { name: "Исправленное название мероприятия", exact: true }).fill("Исправленная встреча");
  await applicant.getByRole("button", { name: "Отправить повторно", exact: true }).click();
  await expect(applicant.getByRole("status")).toHaveText("На согласовании");
  await page.reload();
  await expect(applicant.getByRole("status")).toHaveText("На согласовании");
  await expect(applicant.getByText("Исправленная встреча", { exact: true })).toBeVisible();
});

test("E2E-REV-03: second return still requires a comment and updates latest reason", async ({ page }) => {
  const { review, applicant } = await returnForRevision(page, "Уточните название");
  await switchRole(page, "Организатор");
  await applicant.getByRole("textbox", { name: "Исправленное название мероприятия", exact: true }).fill("Исправленная встреча");
  await applicant.getByRole("button", { name: "Отправить повторно", exact: true }).click();
  await switchRole(page, "Согласующий");
  await review.getByRole("textbox", { name: "Комментарий", exact: true }).fill("   ");
  await review.getByRole("button", { name: "Вернуть на доработку", exact: true }).click();
  await expect(review.getByRole("alert")).toHaveText("Добавьте комментарий, чтобы вернуть заявку на доработку");
  await expect(applicant.getByRole("status")).toHaveText("На согласовании");
  await review.getByRole("textbox", { name: "Комментарий", exact: true }).fill("Уточните программу");
  await review.getByRole("button", { name: "Вернуть на доработку", exact: true }).click();
  await expect(applicant.getByRole("status")).toHaveText("На доработке");
  await expect(applicant.getByText("Уточните программу", { exact: true })).toBeVisible();
  await page.reload();
  await expect(applicant.getByRole("status")).toHaveText("На доработке");
  await expect(applicant.getByText("Уточните программу", { exact: true })).toBeVisible();
});
