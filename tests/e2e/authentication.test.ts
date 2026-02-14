import { waitFor } from "@playwright-testing-library/test";
import { createUser, createUserAndLogin, expect, test } from "./utils";
import prisma from "~/server/data/prisma.server";
import { verifyPassword } from "~/server/data/users/passwordUtils.server";

const EMAIL = "test@mail.com";
const NAME = "Test name";
const AGE = "39";
const HEIGHT = "170";
const WEIGHT = "82";
const PASSWORD = "foobar";

test("signs up", async ({ page, screen }) => {
  await page.goto("/signup");

  await (await screen.findByLabelText("Email")).fill(EMAIL);
  await screen.getByLabelText("Name").fill(NAME);
  await screen.getByLabelText("Age").fill(AGE);
  await screen.getByLabelText("Height (cm)").fill(HEIGHT);
  await screen.getByLabelText("Weight (kg)").fill(WEIGHT);
  await screen.locator("select[name='gender']").selectOption("FEMALE");
  await screen
    .locator("select[name='fitnessLevel']")
    .selectOption("VERY_ACTIVE");
  await screen.locator("select[name='weightLossGoal']").selectOption("MEDIUM");
  await screen.getByLabelText("Password").fill(PASSWORD);
  await screen.getByLabelText("Confirm password").fill(PASSWORD);
  await screen
    .getByLabelText("Invite token")
    .fill("xico o maior da minha aldeia");
  await screen
    .getByText("Sign up", { selector: "button > span > span" })
    .click();

  await expect(page).toHaveURL("/diary");
  await waitFor(async () => {
    const user = await prisma.user.findFirstOrThrow({
      where: { email: EMAIL },
    });
    expect(user.name).toEqual(NAME);
    expect(user.email).toEqual(EMAIL);
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
  await screen.getByText("Login", { selector: "button > span > span" }).click();

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
  await screen.getByText("Login", { selector: "button > span > span" }).click();

  await expect(page).toHaveURL("/settings");
});

test("logs out and drops user on login page", async ({ page, screen }) => {
  const user = await createUserAndLogin(page, screen);

  await screen.getByText("Log out").click();

  expect(
    await (
      await screen.findByText("Login", { selector: "button > span > span" })
    ).count(),
  ).toBe(1);
  expect(await screen.queryByText(user.name).count()).toBe(0);
});
