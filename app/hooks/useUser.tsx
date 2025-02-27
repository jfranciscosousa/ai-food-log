import { useRouteLoaderData } from "react-router";
import type { Info } from "../routes/+types/__authed";

export function useOptionalUser(): Info["loaderData"]["user"] | undefined {
  return useRouteLoaderData("routes/__authed")?.user;
}

export default function useUser(): NonNullable<Info["loaderData"]["user"]> {
  return useRouteLoaderData("routes/__authed")!.user;
}
