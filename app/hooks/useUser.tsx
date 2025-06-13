import { useRouteLoaderData } from "react-router";
import type { Route } from "../routes/+types/__authed";

export function useOptionalUser():
  | Route.ComponentProps["loaderData"]["user"]
  | undefined {
  return useRouteLoaderData("routes/__authed")?.user;
}

export default function useUser(): NonNullable<
  Route.ComponentProps["loaderData"]["user"]
> {
  return useRouteLoaderData("routes/__authed")!.user;
}
