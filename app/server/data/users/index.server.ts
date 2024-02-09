import { FitnessLevel, User } from "@prisma/client";
import { zfd } from "zod-form-data";
import { z } from "zod";
import { encryptPassword, verifyPassword } from "./passwordUtils.server";
import prisma from "../prisma.server";
import { DataResult } from "../utils/types";
import { formatZodErrors } from "../utils/formatZodErrors.server";

export const createUserParams = zfd.formData({
  inviteToken: zfd.text(),
  email: zfd.text(z.string().email()),
  name: zfd.text(),
  password: zfd.text(),
  passwordConfirmation: zfd.text(),
  height: zfd.numeric(),
  weight: zfd.numeric(),
  fitnessLevel: zfd.text(
    z.enum([
      FitnessLevel.EXTRA_ACTIVE,
      FitnessLevel.LIGHTLY_ACTIVE,
      FitnessLevel.MODERATELY_ACTIVE,
      FitnessLevel.SEDENTARY,
      FitnessLevel.VERY_ACTIVE,
    ]),
  ),
  rememberMe: zfd.checkbox().optional(),
});

export type CreateUserParams = z.infer<typeof createUserParams> | FormData;

export async function findUserByEmail(
  email: string,
): Promise<Omit<User, "password"> | null> {
  const user = await prisma.user.findUnique({ where: { email } });

  if (user) user.password = "";

  return user;
}

export async function createUser(
  params: CreateUserParams,
): Promise<DataResult<Omit<User, "password"> & { rememberMe?: boolean }>> {
  const parsedSchema = createUserParams.safeParse(params);

  if (!parsedSchema.success)
    return { data: null, errors: formatZodErrors(parsedSchema.error) };

  const {
    inviteToken,
    email,
    name,
    password,
    passwordConfirmation,
    height,
    weight,
    fitnessLevel,
    rememberMe,
  } = parsedSchema.data;

  if (inviteToken !== "xico o maior da minha aldeia") {
    return { data: null, errors: { inviteToken: "Invlid invite token!" } };
  }

  if (password !== passwordConfirmation) {
    return {
      data: null,
      errors: { passwordConfirmation: "Passwords do not match!" },
    };
  }

  if (await findUserByEmail(email)) {
    return { data: null, errors: { email: "User already exists!" } };
  }

  const bmi = 0;
  const bmr = 0;

  const encryptedPassword = await encryptPassword(password);
  const user = await prisma.user.create({
    data: {
      email,
      name,
      password: encryptedPassword,
      height,
      weight,
      fitnessLevel,
      bmi,
      bmr,
    },
  });

  user.password = "";

  return { data: { ...user, rememberMe }, errors: null };
}

const updateUserParams = zfd.formData({
  email: zfd.text(z.string().email().optional()),
  name: zfd.text(z.string().optional()),
  currentPassword: zfd.text(),
  newPassword: zfd.text(z.string().optional()),
  passwordConfirmation: zfd.text(z.string().optional()),
  height: zfd.numeric(z.number().optional()),
  weight: zfd.numeric(z.number().optional()),
  fitnessLevel: zfd.text(
    z
      .enum([
        FitnessLevel.EXTRA_ACTIVE,
        FitnessLevel.LIGHTLY_ACTIVE,
        FitnessLevel.MODERATELY_ACTIVE,
        FitnessLevel.SEDENTARY,
        FitnessLevel.VERY_ACTIVE,
      ])
      .optional(),
  ),
});

export type UpdateUserParams = z.infer<typeof updateUserParams> | FormData;

export async function updateUser(
  userId: string,
  params: UpdateUserParams,
): Promise<DataResult<Omit<User, "password">>> {
  const parsedSchema = updateUserParams.safeParse(params);

  if (!parsedSchema.success)
    return { data: null, errors: formatZodErrors(parsedSchema.error) };
  console.log(parsedSchema.data);
  const {
    name,
    email,
    height,
    weight,
    fitnessLevel,
    newPassword,
    passwordConfirmation,
    currentPassword,
  } = parsedSchema.data;

  if (newPassword !== passwordConfirmation) {
    return {
      data: null,
      errors: { passwordConfirmation: "Passwords do not match" },
    };
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) return { data: null, errors: { userid: "User not found!" } };

  if (!(await verifyPassword(user.password, currentPassword))) {
    return { data: null, errors: { currentPassword: "Wrong password" } };
  }

  const encryptedPassword = newPassword
    ? await encryptPassword(newPassword)
    : undefined;
  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: {
      email,
      name,
      password: encryptedPassword,
      height,
      weight,
      fitnessLevel,
    },
  });

  if (updatedUser) updatedUser.password = "";

  return { data: updatedUser, errors: null };
}

export async function deleteUser(user: User): Promise<Omit<User, "password">> {
  const [_, deletedUser] = await prisma.$transaction([
    prisma.foodEntry.deleteMany({ where: { userId: user.id } }),
    prisma.user.delete({ where: { id: user.id } }),
  ]);

  if (deletedUser) deletedUser.password = "";

  return deletedUser;
}
