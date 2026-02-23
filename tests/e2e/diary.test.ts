import { waitFor } from "@playwright-testing-library/test";
import { expect } from "@playwright/test";
import { addDays, subDays } from "date-fns";
import prisma from "~/server/data/prisma.server";
import { createUserAndLogin, test } from "./utils";

test("register a food and have it show up below", async ({ page, screen }) => {
  await createUserAndLogin(page, screen);

  await page.goto("/diary");

  // Wait for the page to load and verify no meals initially
  await waitFor(async () => {
    expect(await page.getByText("No meals yet").count()).toBe(1);
  });

  // Add a meal
  const mealInput = screen.getByLabelText("Meal Description");
  await mealInput.fill("rice and chicken");
  await page.getByRole("button", { name: "Add" }).click();

  // Wait for the entry to appear
  await waitFor(async () => {
    // The mock returns "Rice and Chicken" as the name
    expect(await page.getByText("Rice and Chicken").count()).toBeGreaterThan(0);
  });

  // Verify "No meals yet" is gone
  expect(await page.getByText("No meals yet").count()).toBe(0);
});

test("register a food in previous day, verify not in current day, then navigate back", async ({
  page,
  screen,
}) => {
  const user = await createUserAndLogin(page, screen);
  const today = new Date();
  const yesterday = subDays(today, 1);

  // Create an entry directly in the database for yesterday
  await prisma.foodEntry.create({
    data: {
      content: "yesterday meal",
      name: "Yesterday's Breakfast",
      icon: "Coffee",
      calories: 500,
      protein: 20,
      carbs: 60,
      fat: 15,
      fiber: 5,
      day: yesterday,
      userId: user.id,
      aiResponse: {},
      items: {
        create: [
          {
            name: "Oatmeal",
            servingSize: 100,
            calories: 500,
            protein: 20,
            carbs: 60,
            fat: 15,
            fiber: 5,
          },
        ],
      },
    },
  });

  await page.goto("/diary");

  // Wait for the page to load and verify the entry is NOT in today's view
  await waitFor(async () => {
    expect(await page.getByText("No meals yet").count()).toBe(1);
  });
  expect(await page.getByText("Yesterday's Breakfast").count()).toBe(0);

  // Navigate to previous day using the left chevron
  await page
    .getByRole("link")
    .filter({ has: page.locator("svg.lucide-chevron-left") })
    .click();

  // Wait for URL to update with yesterday's date
  await page.waitForURL(/date=/);

  // Wait for the entry to appear
  await waitFor(async () => {
    expect(
      await page.getByText("Yesterday's Breakfast").count(),
    ).toBeGreaterThan(0);
  });

  // Verify "No meals yet" is not shown
  expect(await page.getByText("No meals yet").count()).toBe(0);
});

test("register a food in next day, verify not in current day, then navigate forward", async ({
  page,
  screen,
}) => {
  const user = await createUserAndLogin(page, screen);
  const today = new Date();
  const tomorrow = addDays(today, 1);

  // Create an entry directly in the database for tomorrow
  await prisma.foodEntry.create({
    data: {
      content: "tomorrow meal",
      name: "Tomorrow's Lunch",
      icon: "Pizza",
      calories: 800,
      protein: 35,
      carbs: 90,
      fat: 25,
      fiber: 8,
      day: tomorrow,
      userId: user.id,
      aiResponse: {},
      items: {
        create: [
          {
            name: "Pizza Slice",
            servingSize: 200,
            calories: 800,
            protein: 35,
            carbs: 90,
            fat: 25,
            fiber: 8,
          },
        ],
      },
    },
  });

  await page.goto("/diary");

  // Wait for the page to load and verify the entry is NOT in today's view
  await waitFor(async () => {
    expect(await page.getByText("No meals yet").count()).toBe(1);
  });
  expect(await page.getByText("Tomorrow's Lunch").count()).toBe(0);

  // Navigate to next day using the right chevron
  await page
    .getByRole("link")
    .filter({ has: page.locator("svg.lucide-chevron-right") })
    .click();

  // Wait for URL to update with tomorrow's date
  await page.waitForURL(/date=/);

  // Wait for the entry to appear
  await waitFor(async () => {
    expect(await page.getByText("Tomorrow's Lunch").count()).toBeGreaterThan(0);
  });

  // Verify "No meals yet" is not shown
  expect(await page.getByText("No meals yet").count()).toBe(0);
});
