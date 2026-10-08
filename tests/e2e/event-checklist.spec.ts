import { expect, test } from "@playwright/test";

const STORAGE_KEY = "workshop-event-checklist";

function futureDate(daysAhead = 30) {
  const date = new Date();
  date.setDate(date.getDate() + daysAhead);
  return date.toISOString().slice(0, 10);
}

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.evaluate((key) => localStorage.removeItem(key), STORAGE_KEY);
  await page.reload();
});

test("S1: participant creates an event with a future date", async ({ page }) => {
  const date = futureDate();
  await page.getByLabel("Название события").fill("Демо продукта");
  await page.getByLabel("Дата события").fill(date);
  await page.getByRole("button", { name: "Создать событие" }).click();

  await expect(page.getByRole("heading", { name: "Демо продукта" })).toBeVisible();
  await expect(page.getByText(`Дата события: ${date}`)).toBeVisible();
  await expect(page.getByTestId("remaining-count")).toHaveText("Осталось задач: 0");
});

test("S2: participant adds a task and marks it complete", async ({ page }) => {
  await page.getByLabel("Название события").fill("Демо продукта");
  await page.getByLabel("Дата события").fill(futureDate());
  await page.getByRole("button", { name: "Создать событие" }).click();

  await page.getByLabel("Новая задача").fill("Подготовить демонстрацию");
  await page.getByRole("button", { name: "Добавить задачу" }).click();
  await expect(page.getByTestId("remaining-count")).toHaveText("Осталось задач: 1");

  await page.getByRole("checkbox", { name: "Подготовить демонстрацию" }).check();
  await expect(page.getByTestId("remaining-count")).toHaveText("Осталось задач: 0");
  await expect(page.getByText("Подготовить демонстрацию")).toHaveClass(/completed/);
});

test("S3: participant sees clear validation for invalid event data", async ({ page }) => {
  await page.getByRole("button", { name: "Создать событие" }).click();
  await expect(page.getByText("Введите название события")).toBeVisible();
  await expect(page.getByText("Выберите дату события")).toBeVisible();

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  await page.getByLabel("Название события").fill("Встреча");
  await page.getByLabel("Дата события").fill(yesterday.toISOString().slice(0, 10));
  await page.getByRole("button", { name: "Создать событие" }).click();
  await expect(page.getByText("Дата события не может быть в прошлом")).toBeVisible();

  await page.getByLabel("Дата события").fill(futureDate());
  await page.getByRole("button", { name: "Создать событие" }).click();
  await page.getByRole("button", { name: "Добавить задачу" }).click();
  await expect(page.getByText("Введите задачу")).toBeVisible();
});

test("S4: event and task state survive a page reload", async ({ page }) => {
  await page.getByLabel("Название события").fill("Демо продукта");
  await page.getByLabel("Дата события").fill(futureDate());
  await page.getByRole("button", { name: "Создать событие" }).click();
  await page.getByLabel("Новая задача").fill("Проверить сценарии");
  await page.getByRole("button", { name: "Добавить задачу" }).click();
  await page.getByRole("checkbox", { name: "Проверить сценарии" }).check();

  await page.reload();

  await expect(page.getByRole("heading", { name: "Демо продукта" })).toBeVisible();
  await expect(page.getByRole("checkbox", { name: "Проверить сценарии" })).toBeChecked();
  await expect(page.getByTestId("remaining-count")).toHaveText("Осталось задач: 0");
});
