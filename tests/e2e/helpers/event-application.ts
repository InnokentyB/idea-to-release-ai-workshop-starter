import { expect, type Page } from "@playwright/test";

export const mandatoryTasks = [
  "Подтвердить площадку",
  "Согласовать программу",
  "Уведомить участников",
  "Проверить оборудование",
];

export async function submitApplication(page: Page, eventName = "Встреча отдела") {
  await page.goto("/");
  await page.getByRole("button", { name: "Организатор", exact: true }).click();
  const title = page.getByRole("textbox", { name: "Название мероприятия", exact: true });
  if (!(await title.isVisible())) {
    await page.getByRole("button", { name: "Новая заявка", exact: true }).click();
  }
  await expect(title, "Заявитель может начать подачу заявки через интерфейс").toBeVisible();
  await title.fill(eventName);
  await page.getByRole("button", { name: "Подать заявку", exact: true }).click();

  const review = page.getByRole("region", { name: "Согласование заявки", exact: true });
  const applicant = page.getByRole("region", { name: "Состояние заявки", exact: true });
  const preparation = page.getByRole("region", { name: "Подготовка мероприятия", exact: true });
  await expect(review.getByText(eventName, { exact: true })).toBeVisible();
  await expect(applicant.getByText(eventName, { exact: true })).toBeVisible();
  await expect(review.getByRole("status")).toHaveText("На согласовании");
  await expect(applicant.getByRole("status")).toHaveText("На согласовании");
  await page.getByRole("button", { name: "Согласующий", exact: true }).click();
  return { review, applicant, preparation };
}

// Exact action + exact title; escaping preserves literal hostile-input titles.
export function applicationActionName(title: string): RegExp {
  const escapedTitle = title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`^(?:Открыть|Исправить заявку|Продолжить подготовку|Рассмотреть заявку) ${escapedTitle}$`);
}

export const applicationActions = /^(?:Открыть|Исправить заявку|Продолжить подготовку|Рассмотреть заявку) /;
