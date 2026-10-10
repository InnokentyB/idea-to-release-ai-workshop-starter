import { expect, test } from "@playwright/test";
import { applicationActionName, applicationActions, mandatoryTasks, submitApplication } from "./helpers/event-application";

const STORAGE_KEY = "event-applications-v1";

// Valid application state is created only through the real user interface.
// Invalid storage and denied writes exercise the browser persistence boundary.
test("E2E-LOCAL-01: approval and partial preparation survive a reload", async ({ page }) => {
  const { review, applicant, preparation } = await submitApplication(page, "Семинар команды");
  await review.getByRole("button", { name: "Согласовать", exact: true }).click();
  await page.getByRole("button", { name: "Организатор", exact: true }).click();
  await preparation.getByRole("checkbox", { name: mandatoryTasks[0], exact: true }).check();
  await page.reload();
  await page.getByRole("button", { name: applicationActionName("Семинар команды") }).click();

  await expect(applicant.getByText("Семинар команды", { exact: true })).toBeVisible();
  await expect(review.getByRole("status")).toHaveText("Согласовано");
  await expect(applicant.getByRole("status")).toHaveText("Согласовано");
  await expect(preparation.getByRole("checkbox", { name: mandatoryTasks[0], exact: true })).toBeChecked();
  for (const title of mandatoryTasks.slice(1)) {
    await expect(preparation.getByRole("checkbox", { name: title, exact: true })).not.toBeChecked();
  }
  await expect(preparation.getByText("Осталось обязательных задач: 3", { exact: true })).toBeVisible();
  await expect(preparation.getByRole("status")).toHaveText("Не готово");
});

test("E2E-LOCAL-02: multiple applications keep independent decisions and tasks after reload", async ({ page }) => {
  const first = await submitApplication(page, "Первое мероприятие");
  await first.review.getByRole("button", { name: "Согласовать", exact: true }).click();
  await page.getByRole("button", { name: "Организатор", exact: true }).click();
  await first.preparation.getByRole("checkbox", { name: mandatoryTasks[0], exact: true }).check();

  const second = await submitApplication(page, "Второе мероприятие");
  const comment = "Уточните состав участников";
  await second.review.getByRole("textbox", { name: "Комментарий", exact: true }).fill(comment);
  await second.review.getByRole("button", { name: "Вернуть на доработку", exact: true }).click();
  await page.reload();

  await page.getByRole("button", { name: applicationActionName("Первое мероприятие") }).click();
  await expect(first.review.getByRole("status")).toHaveText("Согласовано");
  await expect(first.preparation.getByRole("checkbox", { name: mandatoryTasks[0], exact: true })).toBeChecked();
  await expect(first.preparation.getByText("Осталось обязательных задач: 3", { exact: true })).toBeVisible();
  await expect(first.applicant.getByText(comment, { exact: true })).toHaveCount(0);

  await page.getByRole("button", { name: "Вернуться к списку", exact: true }).click();
  await page.getByRole("button", { name: applicationActionName("Второе мероприятие") }).click();
  await expect(second.review.getByRole("status")).toHaveText("На доработке");
  await expect(second.applicant.getByText(comment, { exact: true })).toBeVisible();
  await expect(second.applicant.getByText("Исправьте заявку по комментарию и отправьте повторно", { exact: true })).toBeVisible();
  for (const title of mandatoryTasks) {
    const task = second.preparation.getByRole("checkbox", { name: title, exact: true });
    await expect(task).not.toBeChecked();
    await expect(task).toBeDisabled();
  }
  await expect(second.preparation.getByText("Осталось обязательных задач: 4", { exact: true })).toBeVisible();
});

test("E2E-LOCAL-03: denied storage writes show a failure and do not claim durable saving", async ({ page }) => {
  await page.addInitScript(() => {
    Storage.prototype.setItem = function () {
      throw new DOMException("Storage writes denied", "QuotaExceededError");
    };
  });
  await page.goto("/");
  await page.getByRole("button", { name: "Новая заявка", exact: true }).click();
  await page.getByRole("textbox", { name: "Название мероприятия", exact: true }).fill("Несохранённая заявка");
  await page.getByRole("button", { name: "Подать заявку", exact: true }).click();
  await expect(page.getByRole("alert").filter({ hasText: /сохран|хранилищ|данн/i })).toBeVisible();
  await expect(page.getByText(/успешно сохранено|заявка сохранена/i)).toHaveCount(0);
  await page.reload();
  await expect(page.getByRole("button", { name: applicationActionName("Несохранённая заявка") })).toHaveCount(0);
});

for (const [description, payload] of [
  ["invalid JSON", "{broken-json"],
  ["invalid data shape", JSON.stringify({ version: 1, applications: [{ id: "bad", title: "Broken", status: "approved", tasks: "invalid" }] })],
]) {
  test(`E2E-LOCAL-04: ${description} shows a warning and preserves the original payload`, async ({ page }) => {
    await page.goto("/");
    await page.evaluate(({ key, value }) => localStorage.setItem(key, value), { key: STORAGE_KEY, value: payload });
    await page.reload();
    await expect(page.getByRole("alert").filter({ hasText: /сохран|хранилищ|данн/i })).toBeVisible();
    await expect(page.getByRole("main")).toBeVisible();
    expect(await page.evaluate((key) => localStorage.getItem(key), STORAGE_KEY)).toBe(payload);
  });
}

test("E2E-LOCAL-05: application titles and return comments render as literal text", async ({ page }) => {
  const title = '<img src=x onerror="window.__injected=true">';
  const comment = '<script>window.__injected=true</script>';
  const { review, applicant } = await submitApplication(page, title);
  await review.getByRole("textbox", { name: "Комментарий", exact: true }).fill(comment);
  await review.getByRole("button", { name: "Вернуть на доработку", exact: true }).click();
  await expect(applicant.getByText(comment, { exact: true })).toBeVisible();
  await expect(applicant.locator("img, script")).toHaveCount(0);
  expect(await page.evaluate(() => Reflect.get(window, "__injected"))).toBeUndefined();
  await page.reload();
  await page.getByRole("button", { name: applicationActionName(title) }).click();
  await expect(applicant.getByText(title, { exact: true })).toBeVisible();
  await expect(applicant.getByText(comment, { exact: true })).toBeVisible();
  await expect(applicant.locator("img, script")).toHaveCount(0);
  expect(await page.evaluate(() => Reflect.get(window, "__injected"))).toBeUndefined();
});
