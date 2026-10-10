import { expect, test } from "@playwright/test";
import { submitApplication } from "./helpers/event-application";

// Draft public UI contract: docs/tdpd/event-applications/spec.md.
// No production adapter, mocked state transition, or storage fixture.

test("INFRA-RET: browser loads the real application without runtime errors", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  const response = await page.goto("/");
  expect(response?.ok()).toBe(true);
  await expect(page.getByRole("main")).toBeVisible();
  expect(errors).toEqual([]);
});

for (const scenario of [
  { id: "E2E-RET-01", description: "empty comment", comment: "" },
  { id: "E2E-RET-02", description: "whitespace-only comment", comment: "   " },
]) {
  test(`${scenario.id}: return with ${scenario.description} preserves status and explains recovery`, async ({ page }) => {
    const { review, applicant } = await submitApplication(page);
    await review.getByRole("textbox", { name: "Комментарий", exact: true }).fill(scenario.comment);
    await review.getByRole("button", { name: "Вернуть на доработку", exact: true }).click();

    await expect(review.getByRole("alert")).toHaveText(
      "Добавьте комментарий, чтобы вернуть заявку на доработку",
    );
    await expect(review.getByRole("status")).toHaveText("На согласовании");
    await expect(applicant.getByRole("status")).toHaveText("На согласовании");
  });
}

test("E2E-RET-03: return with a comment shows the applicant the decision, reason and next step", async ({ page }) => {
  const { review, applicant } = await submitApplication(page);
  const comment = "Уточните количество участников и бюджет";
  await review.getByRole("textbox", { name: "Комментарий", exact: true }).fill(comment);
  await review.getByRole("button", { name: "Вернуть на доработку", exact: true }).click();

  await expect(review.getByRole("status")).toHaveText("На доработке");
  await expect(applicant.getByRole("status")).toHaveText("На доработке");
  await expect(applicant.getByText(comment, { exact: true })).toBeVisible();
  await expect(applicant.getByText("Исправьте заявку по комментарию и отправьте повторно", { exact: true })).toBeVisible();
});
