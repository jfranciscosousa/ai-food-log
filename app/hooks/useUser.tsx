import { trpc } from "~/utils/trpc";
import type { UserWithoutPassword } from "~/server/data/users.server";

export function useOptionalUser(): UserWithoutPassword | undefined {
  const { data: user } = trpc.auth.me.useQuery(undefined, { retry: false });
  return user ?? undefined;
}

export default function useUser(): UserWithoutPassword {
  const { data: user } = trpc.auth.me.useQuery();
  if (!user) {
    throw new Error(
      "User not found - this hook should only be used in authenticated routes",
    );
  }
  return user;
}
