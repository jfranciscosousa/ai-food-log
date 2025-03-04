import {
  FitnessLevel,
  Gender,
  type User,
  WeightLossGoal,
} from "@prisma/client";
import { z } from "zod";
import { zfd } from "zod-form-data";
import prisma from "./prisma.server";
import { calculateCalorieGoal } from "./users/calculateCalorieGoal.server";
import { encryptPassword, verifyPassword } from "./users/passwordUtils.server";
import { formatZodErrors } from "./utils/formatZodErrors.server";
import { type DataResult } from "./utils/types";

export const createUserParams = zfd.formData({
  inviteToken: zfd.text(),
  email: zfd.text(z.string().email()),
  name: zfd.text(),
  password: zfd.text(),
  passwordConfirmation: zfd.text(),
  age: zfd.numeric(),
  height: zfd.numeric(),
  weight: zfd.numeric(),
  gender: zfd.text(z.enum([Gender.MALE, Gender.FEMALE])),
  fitnessLevel: zfd.text(
    z.enum([
      FitnessLevel.EXTRA_ACTIVE,
      FitnessLevel.LIGHTLY_ACTIVE,
      FitnessLevel.MODERATELY_ACTIVE,
      FitnessLevel.SEDENTARY,
      FitnessLevel.VERY_ACTIVE,
    ]),
  ),
  weightLossGoal: zfd.text(
    z.enum([
      WeightLossGoal.MAINTAIN,
      WeightLossGoal.LOW,
      WeightLossGoal.MEDIUM,
      WeightLossGoal.HIGH,
    ]),
  ),
  rememberMe: zfd.checkbox().optional(),
});

export type CreateUserParams = z.infer<typeof createUserParams> | FormData;

async function findUserByEmail(
  email: string,
): Promise<Omit<User, "password"> | null> {
  const user = await prisma.user.findUnique({ where: { email } });

  if (user) user.password = "";

  return user;
}

export const loginSchema = zfd.formData({
  email: zfd.text(z.string().email()),
  password: zfd.text(),
  redirectUrl: zfd.text(z.string().optional()),
  rememberMe: zfd.checkbox().optional(),
});

export type LoginParams = z.infer<typeof loginSchema> | FormData;

export async function login(
  params: LoginParams,
): Promise<DataResult<User & { rememberMe?: boolean }>> {
  const parsedSchema = loginSchema.safeParse(params);

  if (!parsedSchema.success)
    return { data: null, errors: formatZodErrors(parsedSchema.error) };

  const { email, password, rememberMe } = parsedSchema.data;

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user)
    return { data: null, errors: { email: "Email/Password combo not found" } };

  if (await verifyPassword(user.password, password)) {
    user.password = "";

    return { data: { ...user, rememberMe }, errors: null };
  }

  return { data: null, errors: { email: "Email/Password combo not found" } };
}

async function createUser(
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
    age,
    height,
    weight,
    gender,
    fitnessLevel,
    weightLossGoal,
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
      age,
      gender,
      fitnessLevel,
      weightLossGoal,
      targetCalories: calculateCalorieGoal(
        weight,
        height,
        age,
        gender,
        fitnessLevel,
        weightLossGoal,
      ),
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
  gender: zfd.text(z.enum([Gender.MALE, Gender.FEMALE])),
  age: zfd.numeric(z.number().optional()),
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
  weightLossGoal: zfd.text(
    z
      .enum([
        WeightLossGoal.MAINTAIN,
        WeightLossGoal.LOW,
        WeightLossGoal.MEDIUM,
        WeightLossGoal.HIGH,
      ])
      .optional(),
  ),
});

export type UpdateUserParams = z.infer<typeof updateUserParams> | FormData;

async function updateUser(
  userId: string,
  params: UpdateUserParams,
): Promise<DataResult<Omit<User, "password">>> {
  const parsedSchema = updateUserParams.safeParse(params);

  if (!parsedSchema.success)
    return { data: null, errors: formatZodErrors(parsedSchema.error) };

  const {
    name,
    email,
    age,
    height,
    weight,
    gender,
    fitnessLevel,
    weightLossGoal,
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
      age,
      gender,
      fitnessLevel,
      weightLossGoal,
      targetCalories: calculateCalorieGoal(
        weight || user.weight,
        height || user.height,
        age || user.age,
        gender || user.gender,
        fitnessLevel || user.fitnessLevel,
        weightLossGoal || user.weightLossGoal,
      ),
    },
  });

  if (updatedUser) updatedUser.password = "";

  return { data: updatedUser, errors: null };
}

async function deleteUser(user: User): Promise<Omit<User, "password">> {
  const [_, deletedUser] = await prisma.$transaction([
    prisma.foodEntry.deleteMany({ where: { userId: user.id } }),
    prisma.user.delete({ where: { id: user.id } }),
  ]);

  if (deletedUser) deletedUser.password = "";

  return deletedUser;
}

const Users = {
  login,
  createUser,
  updateUser,
  deleteUser,
};

export default Users;
