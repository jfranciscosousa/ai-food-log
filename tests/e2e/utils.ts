import { faker } from "@faker-js/faker";
import { type Screen } from "@playwright-testing-library/test/dist/fixture/types";
import {
  locatorFixtures as fixtures,
  type LocatorFixtures as TestingLibraryFixtures,
} from "@playwright-testing-library/test/fixture.js";
import { test as base, type Page } from "@playwright/test";
import { UsersService } from "~/server/data/users.server";
import type z from "zod";
import { SERVER_ENV } from "~/env.server";

export const USER_TEST_PASSWORD = "foobar";

export const test = base.extend<TestingLibraryFixtures>(fixtures);

export const expect = test.expect;

export async function createUser(
  params: Partial<z.infer<typeof UsersService.createUserParams>> = {},
) {
  const defaults = {
    inviteToken: SERVER_ENV.INVITE_TOKEN,
    email: faker.internet.email(),
    name: faker.person.firstName(),
    password: USER_TEST_PASSWORD,
    passwordConfirmation: USER_TEST_PASSWORD,
    height: 183,
    weight: 100,
    fitnessLevel: "SEDENTARY",
    age: 36,
    gender: "FEMALE",
    weightLossGoal: "MEDIUM",
  } as const;

  const { data, errors } = await UsersService.create({
    ...defaults,
    ...params,
  });

  if (!data) throw errors;

  return data;
}

export async function createUserAndLogin(page: Page, screen: Screen) {
  const data = await createUser();

  await page.goto("/");

  await (await screen.findByLabelText("Email")).fill(data.email);
  await screen.getByLabelText("Password").fill(USER_TEST_PASSWORD);
  await page.getByRole("button", { name: "Login" }).click();

  // Wait for successful login by checking for the user info in the sidebar
  await page.waitForSelector(`[aria-label="Signed in as ${data.name}"]`);

  return data;
}
