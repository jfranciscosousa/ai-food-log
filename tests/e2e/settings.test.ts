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

test("renders settings", async ({ page, screen }) => {
  const user = await createUserAndLogin(page, screen);

  await page.goto("/settings?tab=account");

  expect(await screen.findByDisplayValue(user.name)).toBeTruthy();
  expect(page.getByText(user.email)).toBeTruthy();
});

test("updates health settings", async ({ page, screen }) => {
  const user = await createUserAndLogin(page, screen);
  const newHeight = String(faker.number.int({ min: 0, max: 100 }));
  const newWeight = String(faker.number.int({ min: 0, max: 100 }));

  await page.goto("/settings?tab=health");
  await screen.getByLabelText("Height (cm)").fill(newHeight);
  await screen.getByLabelText("Weight (kg)").fill(newWeight);
  await page.getByRole("combobox", { name: "Fitness level" }).click();
  await page.getByRole("option", { name: "Extra Active" }).click();
  await page.getByRole("button", { name: "Save changes" }).click();

  await waitFor(async () => {
    const updatedUser = await prisma.user.findFirstOrThrow({
      where: { id: user.id },
    });
    expect(updatedUser.height.toString()).toEqual(newHeight);
    expect(updatedUser.weight.toString()).toEqual(newWeight);
    expect(updatedUser.fitnessLevel).toEqual("EXTRA_ACTIVE");
  });
});

test("updates account settings", async ({ page, screen }) => {
  const user = await createUserAndLogin(page, screen);
  const newName = faker.person.firstName();
  const newEmail = faker.internet.email();
  const newPassword = faker.internet.password({ length: 8 });

  await page.goto("/settings?tab=account");
  await (await screen.findByLabelText("Name")).fill(newName);
  await page.getByLabel("Email").fill(newEmail);
  await page.getByLabel("New password").fill(newPassword);
  await page.getByLabel("Confirm password").fill(newPassword);
  await page.getByLabel("Current password").fill(USER_TEST_PASSWORD);
  await page.getByRole("button", { name: "Save changes" }).click();

  await waitFor(async () => {
    expect(await page.getByText(user.name).count()).toBe(0);

    const updatedUser = await prisma.user.findFirstOrThrow({
      where: { id: user.id },
    });
    expect(updatedUser.name).toEqual(newName);
    expect(updatedUser.email).toEqual(newEmail);
    // Check that the new password is applied
    expect(
      await verifyPassword(updatedUser.password, newPassword),
    ).toBeTruthy();
  });
});

test("does not update account if password confirmation does not match", async ({
  page,
  screen,
}) => {
  const user = await createUserAndLogin(page, screen);
  const newPassword = faker.internet.password({ length: 8 });

  await page.goto("/settings?tab=account");
  await (await screen.findByLabelText("New password")).fill(newPassword);
  await page.getByLabel("Confirm password").fill(newPassword + "bad");
  await page.getByLabel("Current password").fill(USER_TEST_PASSWORD);
  await page.getByRole("button", { name: "Save changes" }).click();

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

test("does not update account if password is bad", async ({ page, screen }) => {
  const user = await createUserAndLogin(page, screen);
  const newName = faker.person.firstName();

  await page.goto("/settings?tab=account");
  await (await screen.findByLabelText("Name")).fill(newName);
  await page.getByLabel("Current password").fill("bad_password");
  await page.getByRole("button", { name: "Save changes" }).click();

  await waitFor(async () => {
    expect(await page.getByText("Wrong password").count()).toBe(1);

    const updatedUser = await prisma.user.findFirstOrThrow({
      where: { email: user.email },
    });
    assertUserSame(updatedUser, user);
  });
});
