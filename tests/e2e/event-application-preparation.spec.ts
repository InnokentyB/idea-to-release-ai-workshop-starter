import { expect, test } from "@playwright/test";
import { mandatoryTasks, submitApplication } from "./helpers/event-application";

test("E2E-PREP-01: preparation is blocked while an application awaits approval", async ({ page }) => {
  const { preparation } = await submitApplication(page);
  await expect(preparation.getByText("Подготовка доступна после согласования", { exact: true })).toBeVisible();
  await expect(preparation.getByText("Осталось обязательных задач: 4", { exact: true })).toBeVisible();
  await expect(preparation.getByRole("status")).toHaveText("Не готово");
  await expect(preparation.getByRole("checkbox")).toHaveCount(4);
  for (const title of mandatoryTasks) {
    const task = preparation.getByRole("checkbox", { name: title, exact: true });
    await expect(task).toBeDisabled();
    await expect(task).not.toBeChecked();
  }
});

test("E2E-PREP-02: a returned application cannot begin preparation", async ({ page }) => {
  const { review, preparation } = await submitApplication(page);
  await review.getByRole("textbox", { name: "Комментарий", exact: true }).fill("Уточните бюджет");
  await review.getByRole("button", { name: "Вернуть на доработку", exact: true }).click();
  await expect(review.getByRole("status")).toHaveText("На доработке");
  for (const title of mandatoryTasks) {
    const task = preparation.getByRole("checkbox", { name: title, exact: true });
    await expect(task).toBeDisabled();
    await expect(task).not.toBeChecked();
  }
  await expect(preparation.getByRole("status")).toHaveText("Не готово");
});

test("E2E-APP-01: approval records the decision for both sides and unlocks mandatory tasks", async ({ page }) => {
  const { review, applicant, preparation } = await submitApplication(page);
  await review.getByRole("button", { name: "Согласовать", exact: true }).click();
  await page.getByRole("button", { name: "Организатор", exact: true }).click();
  await expect(review.getByRole("status")).toHaveText("Согласовано");
  await expect(applicant.getByRole("status")).toHaveText("Согласовано");
  await expect(applicant.getByText("Можно приступать к подготовке мероприятия", { exact: true })).toBeVisible();
  await expect(preparation.getByRole("status")).toHaveText("Не готово");
  await expect(preparation.getByRole("checkbox")).toHaveCount(4);
  for (const title of mandatoryTasks) {
    const task = preparation.getByRole("checkbox", { name: title, exact: true });
    await expect(task).toBeEnabled();
    await expect(task).not.toBeChecked();
  }
});

test("E2E-PREP-03: readiness requires every mandatory task and follows remaining work", async ({ page }) => {
  const { review, preparation } = await submitApplication(page);
  await review.getByRole("button", { name: "Согласовать", exact: true }).click();
  await page.getByRole("button", { name: "Организатор", exact: true }).click();
  for (const [index, title] of mandatoryTasks.entries()) {
    await preparation.getByRole("checkbox", { name: title, exact: true }).check();
    const remaining = mandatoryTasks.length - index - 1;
    await expect(preparation.getByText(`Осталось обязательных задач: ${remaining}`, { exact: true })).toBeVisible();
    await expect(preparation.getByRole("status")).toHaveText(remaining === 0 ? "Готово" : "Не готово");
  }
  await preparation.getByRole("checkbox", { name: mandatoryTasks[0], exact: true }).uncheck();
  await expect(preparation.getByText("Осталось обязательных задач: 1", { exact: true })).toBeVisible();
  await expect(preparation.getByRole("status")).toHaveText("Не готово");
});

for (const eventName of ["Встреча отдела", "Обучающий семинар"]) {
  test(`E2E-PREP-04: ${eventName} uses the same mandatory checklist`, async ({ page }) => {
    const { preparation } = await submitApplication(page, eventName);
    await expect(preparation.getByRole("checkbox")).toHaveCount(mandatoryTasks.length);
    for (const title of mandatoryTasks) {
      await expect(preparation.getByRole("checkbox", { name: title, exact: true })).toBeVisible();
    }
  });
}
