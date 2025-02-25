import { faker } from "@faker-js/faker";
import { type Screen } from "@playwright-testing-library/test/dist/fixture/types";
import {
  locatorFixtures as fixtures,
  type LocatorFixtures as TestingLibraryFixtures,
} from "@playwright-testing-library/test/fixture.js";
import { test as base, type Page } from "@playwright/test";
import { createUser } from "~/server/data/users/index.server";
import { truncateAll } from "./truncateAll";

export const USER_TEST_PASSWORD = "foobar";

export const test = base.extend<TestingLibraryFixtures>(fixtures);

/**
 * Truncates the database between each test
 */
test.beforeEach(truncateAll);

export const expect = test.expect;

export async function createUserAndLogin(page: Page, screen: Screen) {
  const password = USER_TEST_PASSWORD;
  const { errors, data } = await createUser({
    inviteToken: "xico o maior da minha aldeia",
    email: faker.internet.email(),
    name: faker.name.firstName(),
    password,
    passwordConfirmation: password,
    height: 183,
    weight: 100,
    fitnessLevel: "SEDENTARY",
    age: 36,
    gender: "FEMALE",
    weightLossGoal: "MEDIUM",
  });

  if (!data) throw errors;

  await page.goto("/");

  await screen.getByLabelText("Email").fill(data.email);
  await screen.getByLabelText("Password").fill(password);
  await screen.getByText("Login").click();
  await page.getByRole("button", { name: "User nav" }).click();
  await screen.findByText(data.name);

  return data;
}
