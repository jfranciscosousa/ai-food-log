import { type FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import { userIdFromRequest } from "../auth.server";

export async function createContext({
  req,
  resHeaders,
}: FetchCreateContextFnOptions) {
  const userId = await userIdFromRequest(req);

  return {
    userId,
    req,
    resHeaders,
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
