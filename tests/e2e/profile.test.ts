import { faker } from "@faker-js/faker";
import { waitFor } from "@playwright-testing-library/test";
import { expect } from "@playwright/test";
import { verifyPassword } from "~/server/data/users/passwordUtils.server";
import prisma from "~/server/data/prisma.server";
import { createUserAndLogin, test, USER_TEST_PASSWORD } from "./utils";

function assertUserSame(user1: object, user2: object) {
  return expect(
    JSON.parse(JSON.stringify({ ...user1, password: null, updatedAt: null })),
  ).toEqual(
    JSON.parse(
      JSON.stringify({
        ...user2,
        password: null,
        updatedAt: null,
      }),
    ),
  );
}

test("renders profile", async ({ page, screen }) => {
  const user = await createUserAndLogin(page, screen);

  await page.goto("/profile");

  expect(page.getByText(user.name)).toBeTruthy();
  expect(page.getByText(user.email)).toBeTruthy();
});

test("updates profile", async ({ page, screen }) => {
  const user = await createUserAndLogin(page, screen);
  const newName = faker.person.firstName();
  const newEmail = faker.internet.email();
  const newPassword = faker.internet.password({ length: 8 });
  const newHeight = String(faker.number.int({ min: 0, max: 100 }));
  const newWeight = String(faker.number.int({ min: 0, max: 100 }));

  await page.goto("/profile");
  await page.getByLabel("Name").fill(newName);
  await page.getByLabel("Email").fill(newEmail);
  await screen.getByLabelText("Height (cm)").fill(newHeight);
  await screen.getByLabelText("Weight (kg)").fill(newWeight);
  await screen
    .locator("select[name='fitnessLevel']")
    .selectOption("EXTRA_ACTIVE");
  await page.getByLabel("New password").fill(newPassword);
  await page.getByLabel("Confirm password").fill(newPassword);
  await page.getByLabel("Current password").fill(USER_TEST_PASSWORD);
  await page.getByText("Update profile").click();

  await waitFor(async () => {
    expect(await page.getByText(user.name).count()).toBe(0);

    const updatedUser = await prisma.user.findFirstOrThrow({
      where: { id: user.id },
    });
    expect(updatedUser.name).toEqual(newName);
    expect(updatedUser.email).toEqual(newEmail);
    expect(updatedUser.height.toString()).toEqual(newHeight);
    expect(updatedUser.weight.toString()).toEqual(newWeight);
    expect(updatedUser.fitnessLevel).toEqual("EXTRA_ACTIVE");
    // Check that the new password is applied
    expect(
      await verifyPassword(updatedUser.password, newPassword),
    ).toBeTruthy();
  });
});

test("does not update profile if password confirmation does not match", async ({
  page,
  screen,
}) => {
  const user = await createUserAndLogin(page, screen);
  const newPassword = faker.internet.password({ length: 8 });

  await page.goto("/profile");
  await page.getByLabel("New password").fill(newPassword);
  await page.getByLabel("Confirm password").fill(newPassword + "bad");
  await page.getByLabel("Current password").fill(USER_TEST_PASSWORD);
  await page.getByText("Update profile").click();

  await waitFor(async () => {
    expect(await page.getByText("Passwords do not match").count()).toBe(1);

    const updatedUser = await prisma.user.findFirstOrThrow({
      where: { email: user.email },
    });
    assertUserSame(updatedUser, user);
    // Check that the old password is still valid
    expect(
      await verifyPassword(updatedUser.password, USER_TEST_PASSWORD),
    ).toBeTruthy();
  });
});

test("does not update profile if password is bad", async ({ page, screen }) => {
  const user = await createUserAndLogin(page, screen);
  const newName = faker.person.firstName();

  await page.goto("/profile");
  await page.getByLabel("Name").fill(newName);
  await page.getByLabel("Current password").fill("bad_password");
  await page.getByText("Update profile").click();

  await waitFor(async () => {
    expect(await page.getByText("Wrong password").count()).toBe(1);

    const updatedUser = await prisma.user.findFirstOrThrow({
      where: { email: user.email },
    });
    assertUserSame(updatedUser, user);
  });
});
