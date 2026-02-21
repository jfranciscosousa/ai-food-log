import { addDays } from "date-fns";
import { createCookie } from "react-router";
import { SERVER_ENV } from "~/env.server";
import prisma from "~/server/data/prisma.server";

const authCookie = createCookie("auth", {
  secrets: [SERVER_ENV.SECRET_KEY_BASE],
  sameSite: "lax",
  httpOnly: true,
  secure: SERVER_ENV.SECURE_AUTH_COOKIE,
});

export async function authenticate(
  user: { id: string },
  headers: Headers,
  { rememberMe = false } = {},
) {
  headers.append(
    "Set-Cookie",
    await authCookie.serialize(
      {
        userId: user.id,
      },
      {
        expires: rememberMe ? addDays(new Date(), 1) : addDays(new Date(), 30),
      },
    ),
  );
}

export async function logout(headers: Headers) {
  headers.append("Set-Cookie", await authCookie.serialize({}));
}

export async function userIdFromRequest(request: Request) {
  const cookieHeader = request.headers.get("Cookie");
  const { userId } = (await authCookie.parse(cookieHeader)) || {};

  return userId as string;
}

export async function userFromRequest(request: Request) {
  const userId = await userIdFromRequest(request);

  if (!userId) return null;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
      updatedAt: true,
      featureFlags: true,
      height: true,
      weight: true,
      gender: true,
      age: true,
      fitnessLevel: true,
      weightLossGoal: true,
      targetCalories: true,
      targetProtein: true,
      targetCarbs: true,
      targetFat: true,
      targetFiber: true,
      workoutPreferences: true,
      bmr: true,
      bmi: true,
    },
  });

  return user;
}

export { authCookie };
