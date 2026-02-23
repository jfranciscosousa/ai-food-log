import { waitFor } from "@playwright-testing-library/test";
import { expect } from "@playwright/test";
import { createUserAndLogin, test } from "./utils";

test("preview food and add to diary", async ({ page, screen }) => {
  await createUserAndLogin(page, screen);

  await page.goto("/preview");

  // Enter food input
  const input = screen.getByLabelText("Food description");
  await input.fill("rice and chicken");
  await page.getByRole("button", { name: "Analyze Food" }).click();

  // Wait for the URL to update with the input parameter
  await page.waitForURL(/input=rice/);

  // Wait for the preview to load and verify it shows the mocked result
  await waitFor(async () => {
    // Check that the preview result is displayed - looking for the card title "Add to Diary"
    expect(await page.getByText("Add to Diary").count()).toBeGreaterThan(0);
  });

  // Click the "Add to {date}" button
  await page.getByRole("button", { name: /^Add to/ }).click();

  // Verify we're redirected to the diary page and see a success toast
  await waitFor(async () => {
    expect(page.url()).toContain("/diary");
    // Check for toast success message
    expect(
      await page.getByText(/Added to diary|Successfully added/i).count(),
    ).toBeGreaterThan(0);
  });
});
