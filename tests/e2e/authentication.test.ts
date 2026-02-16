import { waitFor } from "@playwright-testing-library/test";
import { createUser, createUserAndLogin, expect, test } from "./utils";
import prisma from "~/server/data/prisma.server";
import { verifyPassword } from "~/server/data/users/passwordUtils.server";
import { faker } from "@faker-js/faker";

const NAME = "Test name";
const AGE = "39";
const HEIGHT = "170";
const WEIGHT = "82";
const PASSWORD = "foobar";

test("signs up", async ({ page, screen }) => {
  const email = faker.internet.email();

  await page.goto("/signup");

  // Step 1: Welcome - Email, Name, Password
  await (await screen.findByLabelText("Email")).fill(email);
  await screen.getByLabelText("Name").fill(NAME);
  await screen.getByLabelText("Password").fill(PASSWORD);
  await screen.getByLabelText("Confirm password").fill(PASSWORD);
  await page.getByRole("button", { name: "Next" }).click();

  // Step 2: About You - Gender, Age, Height, Weight
  await page.getByText("Step 2 of 4").waitFor(); // Wait for step 2 to load
  await page.getByRole("combobox", { name: "Gender" }).click();
  await page.getByRole("option", { name: "Female" }).click();
  await page.getByLabel("Age").fill(AGE);
  await page.getByLabel("Height (cm)").fill(HEIGHT);
  await page.getByLabel("Weight (kg)").fill(WEIGHT);
  await page.getByRole("button", { name: "Next" }).click();

  // Step 3: Goals - Fitness level, Weight loss goal
  await page.getByText("Step 3 of 4").waitFor(); // Wait for step 3 to load
  await page.getByRole("combobox", { name: "Fitness level" }).click();
  await page.getByRole("option", { name: "Very Active" }).click();
  await page.getByRole("combobox", { name: "Weight loss goal" }).click();
  await page.getByRole("option", { name: "Moderate Loss" }).click();
  await page.getByRole("button", { name: "Next" }).click();

  // Step 4: Complete - Invite token
  await page.getByText("Step 4 of 4").waitFor(); // Wait for step 4 to load
  await screen
    .getByLabelText("Invite token")
    .fill("xico o maior da minha aldeia");
  await page.getByRole("button", { name: "Complete" }).click();

  await expect(page).toHaveURL("/diary");
  await waitFor(async () => {
    const user = await prisma.user.findFirstOrThrow({
      where: { email },
    });
    expect(user.name).toEqual(NAME);
    expect(user.email).toEqual(email);
    expect(user.age.toString()).toEqual(AGE);
    expect(user.height.toString()).toEqual(HEIGHT);
    expect(user.weight.toString()).toEqual(WEIGHT);
    expect(user.fitnessLevel).toEqual("VERY_ACTIVE");
    expect(user.weightLossGoal).toEqual("MEDIUM");
    // Check that the new password is applied
    expect(await verifyPassword(user.password, PASSWORD)).toBeTruthy();
  });
});

test("logins", async ({ page, screen }) => {
  const user = await createUser();

  await page.goto("/");
  await (await screen.findByLabelText("Email")).fill(user.email);
  await screen.getByLabelText("Password").fill(PASSWORD);
  await page.getByRole("button", { name: "Login" }).click();

  await expect(page).toHaveURL("/diary");
});

test("shows login and then redirects to original page", async ({
  page,
  screen,
}) => {
  const user = await createUser();

  await page.goto("/settings");
  await (await screen.findByLabelText("Email")).fill(user.email);
  await screen.getByLabelText("Password").fill(PASSWORD);
  await page.getByRole("button", { name: "Login" }).click();

  await expect(page).toHaveURL("/settings");
});

test("logs out and drops user on login page", async ({ page, screen }) => {
  const user = await createUserAndLogin(page, screen);

  await screen.getByText("Log out").click();

  await page.waitForURL("/login");
  await page.getByRole("button", { name: "Login" }).waitFor();

  expect(await page.getByRole("button", { name: "Login" }).count()).toBe(1);
  expect(await screen.queryByText(user.name).count()).toBe(0);
});
