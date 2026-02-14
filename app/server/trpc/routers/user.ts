import { router, protectedProcedure } from "../trpc";
import { UsersService } from "../../data/users.server";
import { createValidationError } from "../errors";
import {
  updateUserSchema,
  updateHealthSchema,
  updateAccountSchema,
} from "../schemas/user";

export const userRouter = router({
  update: protectedProcedure
    .input(updateUserSchema)
    .mutation(async ({ ctx, input }) => {
      const result = await UsersService.update(ctx.userId, input);

      if (result.errors) {
        throw createValidationError("Failed to update profile", result.errors);
      }

      return result.data;
    }),

  updateHealth: protectedProcedure
    .input(updateHealthSchema)
    .mutation(async ({ ctx, input }) => {
      const result = await UsersService.updateHealth(ctx.userId, input);

      if (result.errors) {
        throw createValidationError(
          "Failed to update health settings",
          result.errors,
        );
      }

      return result.data;
    }),

  updateAccount: protectedProcedure
    .input(updateAccountSchema)
    .mutation(async ({ ctx, input }) => {
      const result = await UsersService.updateAccount(ctx.userId, input);

      if (result.errors) {
        throw createValidationError(
          "Failed to update account settings",
          result.errors,
        );
      }

      return result.data;
    }),
});
