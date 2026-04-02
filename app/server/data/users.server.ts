import {
  FitnessLevel,
  Gender,
  type User,
  WeightLossGoal,
} from "~/generated/prisma/browser";
import { z } from "zod";
import { SERVER_ENV } from "~/env.server";
import prisma from "./prisma.server";
import { encryptPassword, verifyPassword } from "./users/passwordUtils.server";
import { formatZodErrors } from "./utils/formatZodErrors.server";
import { type DataResult } from "./utils/types";

export type UserWithoutPassword = Omit<User, "password"> & { password?: never };

export class UsersService {
  // Plain object schemas (for tRPC)
  static readonly createUserParams = z.object({
    inviteToken: z.string(),
    email: z.string().email(),
    name: z.string(),
    password: z.string(),
    passwordConfirmation: z.string(),
    age: z.number(),
    height: z.number(),
    weight: z.number(),
    gender: z.enum([Gender.MALE, Gender.FEMALE]),
    fitnessLevel: z.enum([
      FitnessLevel.EXTRA_ACTIVE,
      FitnessLevel.LIGHTLY_ACTIVE,
      FitnessLevel.MODERATELY_ACTIVE,
      FitnessLevel.SEDENTARY,
      FitnessLevel.VERY_ACTIVE,
    ]),
    weightLossGoal: z.enum([
      WeightLossGoal.MAINTAIN,
      WeightLossGoal.LOW,
      WeightLossGoal.MEDIUM,
      WeightLossGoal.HIGH,
    ]),
    targetCalories: z.number().optional().nullable(),
    rememberMe: z.boolean().optional(),
  });

  static readonly loginSchema = z.object({
    email: z.string().email(),
    password: z.string(),
    rememberMe: z.boolean().optional(),
  });

  static readonly updateUserParams = z.object({
    email: z.string().email().optional(),
    name: z.string().optional(),
    currentPassword: z.string(),
    newPassword: z.string().optional(),
    passwordConfirmation: z.string().optional(),
    gender: z.enum([Gender.MALE, Gender.FEMALE]),
    age: z.number().optional(),
    height: z.number().optional(),
    weight: z.number().optional(),
    fitnessLevel: z
      .enum([
        FitnessLevel.EXTRA_ACTIVE,
        FitnessLevel.LIGHTLY_ACTIVE,
        FitnessLevel.MODERATELY_ACTIVE,
        FitnessLevel.SEDENTARY,
        FitnessLevel.VERY_ACTIVE,
      ])
      .optional(),
    weightLossGoal: z
      .enum([
        WeightLossGoal.MAINTAIN,
        WeightLossGoal.LOW,
        WeightLossGoal.MEDIUM,
        WeightLossGoal.HIGH,
      ])
      .optional(),
    targetProtein: z.number().optional(),
    targetCarbs: z.number().optional(),
    targetFat: z.number().optional(),
    targetFiber: z.number().optional(),
  });

  static readonly updateHealthParams = z.object({
    gender: z.enum([Gender.MALE, Gender.FEMALE]),
    age: z.number(),
    height: z.number(),
    weight: z.number(),
    fitnessLevel: z.enum([
      FitnessLevel.EXTRA_ACTIVE,
      FitnessLevel.LIGHTLY_ACTIVE,
      FitnessLevel.MODERATELY_ACTIVE,
      FitnessLevel.SEDENTARY,
      FitnessLevel.VERY_ACTIVE,
    ]),
    weightLossGoal: z.enum([
      WeightLossGoal.MAINTAIN,
      WeightLossGoal.LOW,
      WeightLossGoal.MEDIUM,
      WeightLossGoal.HIGH,
    ]),
    targetCalories: z.number().optional().nullable(),
    targetProtein: z.number().optional(),
    targetCarbs: z.number().optional(),
    targetFat: z.number().optional(),
    targetFiber: z.number().optional(),
    workoutPreferences: z.string().optional().nullable(),
  });

  static readonly updateAccountParams = z.object({
    email: z.string().email(),
    name: z.string(),
    currentPassword: z.string(),
    newPassword: z.string().optional(),
    passwordConfirmation: z.string().optional(),
  });

  static omitPassword(user: User): UserWithoutPassword {
    const { password, ...rest } = user;
    const _ = password;

    return rest;
  }

  static async findByEmail(email: string): Promise<User | null> {
    const user = await prisma.user.findUnique({ where: { email } });

    return user;
  }

  static async login(
    params: z.infer<typeof UsersService.loginSchema> | FormData,
  ): Promise<DataResult<UserWithoutPassword & { rememberMe?: boolean }>> {
    const parsedSchema = this.loginSchema.safeParse(params);

    if (!parsedSchema.success) {
      return { data: null, errors: formatZodErrors(parsedSchema.error) };
    }

    const { email, password, rememberMe } = parsedSchema.data;

    const user = await this.findByEmail(email);

    if (!user) {
      return {
        data: null,
        errors: { email: "Email/Password combo not found" },
      };
    }

    if (await verifyPassword(user.password, password)) {
      return { data: { ...this.omitPassword(user), rememberMe }, errors: null };
    }

    return {
      data: null,
      errors: { email: "Email/Password combo not found" },
    };
  }

  static async create(
    params: z.infer<typeof UsersService.createUserParams> | FormData,
  ): Promise<DataResult<UserWithoutPassword & { rememberMe?: boolean }>> {
    const parsedSchema = this.createUserParams.safeParse(params);

    if (!parsedSchema.success) {
      return { data: null, errors: formatZodErrors(parsedSchema.error) };
    }

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
      targetCalories,
      rememberMe,
    } = parsedSchema.data;

    if (inviteToken !== SERVER_ENV.INVITE_TOKEN) {
      return {
        data: null,
        errors: { inviteToken: "Invalid invite token!" },
      };
    }

    if (password !== passwordConfirmation) {
      return {
        data: null,
        errors: { passwordConfirmation: "Passwords do not match!" },
      };
    }

    if (await this.findByEmail(email)) {
      return {
        data: null,
        errors: { email: "User already exists!" },
      };
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
        targetCalories,
        bmi,
        bmr,
      },
    });

    return { data: { ...this.omitPassword(user), rememberMe }, errors: null };
  }

  static async update(
    userId: string,
    params: z.infer<typeof UsersService.updateUserParams> | FormData,
  ): Promise<DataResult<UserWithoutPassword>> {
    const parsedSchema = this.updateUserParams.safeParse(params);

    if (!parsedSchema.success) {
      return { data: null, errors: formatZodErrors(parsedSchema.error) };
    }

    const {
      name,
      email,
      age,
      height,
      weight,
      gender,
      fitnessLevel,
      weightLossGoal,
      targetProtein,
      targetCarbs,
      targetFat,
      targetFiber,
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

    if (!user) {
      return {
        data: null,
        errors: { userid: "User not found!" },
      };
    }

    if (!(await verifyPassword(user.password, currentPassword))) {
      return {
        data: null,
        errors: { currentPassword: "Wrong password" },
      };
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
        targetProtein,
        targetCarbs,
        targetFat,
        targetFiber,
      },
    });

    return { data: this.omitPassword(updatedUser), errors: null };
  }

  static async updateHealth(
    userId: string,
    params: z.infer<typeof UsersService.updateHealthParams> | FormData,
  ): Promise<DataResult<UserWithoutPassword>> {
    const parsedSchema = this.updateHealthParams.safeParse(params);

    if (!parsedSchema.success) {
      return { data: null, errors: formatZodErrors(parsedSchema.error) };
    }

    const {
      age,
      height,
      weight,
      gender,
      fitnessLevel,
      weightLossGoal,
      targetCalories,
      targetProtein,
      targetCarbs,
      targetFat,
      targetFiber,
      workoutPreferences,
    } = parsedSchema.data;

    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      return {
        data: null,
        errors: { userid: "User not found!" },
      };
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        height,
        weight,
        age,
        gender,
        fitnessLevel,
        weightLossGoal,
        targetCalories,
        targetProtein,
        targetCarbs,
        targetFat,
        targetFiber,
        workoutPreferences,
      },
    });

    return { data: this.omitPassword(updatedUser), errors: null };
  }

  static async updateAccount(
    userId: string,
    params: z.infer<typeof UsersService.updateAccountParams> | FormData,
  ): Promise<DataResult<UserWithoutPassword>> {
    const parsedSchema = this.updateAccountParams.safeParse(params);

    if (!parsedSchema.success) {
      return { data: null, errors: formatZodErrors(parsedSchema.error) };
    }

    const { name, email, newPassword, passwordConfirmation, currentPassword } =
      parsedSchema.data;

    if (newPassword && newPassword !== passwordConfirmation) {
      return {
        data: null,
        errors: { passwordConfirmation: "Passwords do not match" },
      };
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      return {
        data: null,
        errors: { userid: "User not found!" },
      };
    }

    if (!(await verifyPassword(user.password, currentPassword))) {
      return {
        data: null,
        errors: { currentPassword: "Wrong password" },
      };
    }

    const encryptedPassword = newPassword
      ? await encryptPassword(newPassword)
      : undefined;

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        email,
        name,
        ...(encryptedPassword && { password: encryptedPassword }),
      },
    });

    return { data: this.omitPassword(updatedUser), errors: null };
  }

  static async delete(user: User): Promise<UserWithoutPassword> {
    const [_, deletedUser] = await prisma.$transaction([
      prisma.foodEntry.deleteMany({ where: { userId: user.id } }),
      prisma.user.delete({ where: { id: user.id } }),
    ]);

    return this.omitPassword(deletedUser);
  }
}
