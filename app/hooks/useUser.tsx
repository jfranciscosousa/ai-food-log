import { trpc } from "~/utils/trpc";
import type { UserWithoutPassword } from "~/server/data/users.server";
import { useRootLoaderData } from "./useRootLoaderData";

export function useOptionalUser(): UserWithoutPassword | undefined {
  const { data: user } = trpc.auth.me.useQuery(undefined, {
    initialData: useRootLoaderData().currentUser,
  });

  return user ?? undefined;
}

export default function useUser(): UserWithoutPassword {
  const { data: user } = trpc.auth.me.useQuery(undefined, {
    initialData: useRootLoaderData().currentUser,
  });

  if (!user) {
    throw new Error(
      "User not found - this hook should only be used in authenticated routes",
    );
  }

  return user;
}
