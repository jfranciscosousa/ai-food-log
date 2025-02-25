import { useRouteLoaderData } from "react-router";
import type { Info } from "../+types/root";

export type RootLoaderType = Info["loaderData"];

export function useRootLoaderData(): RootLoaderType {
  return useRouteLoaderData("root")!;
}
