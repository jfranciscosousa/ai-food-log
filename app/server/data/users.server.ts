import {
  FitnessLevel,
  Gender,
  type User,
  WeightLossGoal,
} from "@prisma/client";
import { z } from "zod/v4";
import { zfd } from "zod-form-data";
import prisma from "./prisma.server";
import { calculateCalorieGoal } from "./users/calculateCalorieGoal.server";
import { encryptPassword, verifyPassword } from "./users/passwordUtils.server";
import { formatZodErrors } from "./utils/formatZodErrors.server";
import { type DataResult } from "./utils/types";

export type UserWithoutPassword = Omit<User, "password"> & { password?: never };

export class UsersService {
  static readonly createUserParams = zfd.formData({
    inviteToken: zfd.text(),
    email: zfd.text(z.email()),
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

  static readonly loginSchema = zfd.formData({
    email: zfd.text(z.email()),
    password: zfd.text(),
    redirectUrl: zfd.text(z.string().optional()),
    rememberMe: zfd.checkbox().optional(),
  });

  static readonly updateUserParams = zfd.formData({
    email: zfd.text(z.email().optional()),
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
      rememberMe,
    } = parsedSchema.data;

    if (inviteToken !== "xico o maior da minha aldeia") {
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
