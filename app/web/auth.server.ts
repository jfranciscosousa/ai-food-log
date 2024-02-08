import { createCookie, redirect } from "@remix-run/node";
import { addDays } from "date-fns";
import prisma from "~/data/utils/prisma.server";
import { SERVER_ENV } from "~/env.server";

const authCookie = createCookie("auth", {
  secrets: [SERVER_ENV.SECRET_KEY_BASE],
  sameSite: "strict",
  httpOnly: true,
  secure: SERVER_ENV.SECURE_AUTH_COOKIE,
});

export async function authenticate(
  user: { id: string },
  { redirectUrl = "/", rememberMe = false } = {},
) {
  return redirect(redirectUrl, {
    status: 302,
    headers: {
      location: redirectUrl,
      "Set-Cookie": await authCookie.serialize(
        {
          userId: user.id,
        },
        {
          expires: rememberMe
            ? addDays(new Date(), 1)
            : addDays(new Date(), 30),
        },
      ),
    },
  });
}

export async function logout() {
  return new Response(null, {
    status: 302,
    headers: {
      Location: "/login",
      "Set-Cookie": await authCookie.serialize({}),
    },
  });
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
      bmi: true,
      bmr: true,
      fitnessLevel: true,
    },
  });

  return user;
}
