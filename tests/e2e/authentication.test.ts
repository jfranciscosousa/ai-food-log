import { createUserAndLogin, expect, test } from "./utils";

const EMAIL = "test@mail.com";
const NAME = "Test name";
const HEIGHT = "170";
const WEIGHT = "82";
const PASSWORD = "foobar";

test("signs up", async ({ page, screen }) => {
  await page.goto("/signup");

  await screen.getByLabelText("Email").fill(EMAIL);
  await screen.getByLabelText("Name").fill(NAME);
  await screen.getByLabelText("Height (cm)").fill(HEIGHT);
  await screen.getByLabelText("Weight (kg)").fill(WEIGHT);
  await screen
    .locator("select[name='fitnessLevel']")
    .selectOption("VERY_ACTIVE");
  await screen.getByLabelText("Password").fill(PASSWORD);
  await screen.getByLabelText("Confirm password").fill(PASSWORD);
  await screen
    .getByLabelText("Invite token")
    .fill("xico o maior da minha aldeia");
  await screen.getByText("Sign up", { selector: "button > span" }).click();

  await page.waitForURL("/diary");
});

test("logins", async ({ page, screen }) => {
  await page.goto("/");
  await screen.getByLabelText("Email").fill(EMAIL);
  await screen.getByLabelText("Password").fill(PASSWORD);
  await screen.getByText("Login", { selector: "button > span" }).click();

  await page.waitForURL("/diary");
});

test("shows login and then redirects to original page", async ({
  page,
  screen,
}) => {
  await page.goto("/profile");

  await screen.getByLabelText("Email").fill(EMAIL);
  await screen.getByLabelText("Password").fill(PASSWORD);
  await screen.getByText("Login", { selector: "button > span" }).click();

  await page.waitForURL("/profile");
});

test("logs out and drops user on login page", async ({ page, screen }) => {
  const user = await createUserAndLogin(page, screen);

  await screen.getByText("Logout").click();

  expect(
    await (
      await screen.findByText("Login", { selector: "button > span" })
    ).count(),
  ).toBe(1);
  expect(await screen.queryByText(user.name).count()).toBe(0);
});
