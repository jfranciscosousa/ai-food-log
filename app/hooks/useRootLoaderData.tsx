import { useRouteLoaderData } from "react-router";
import type { Route } from "../+types/root";

export type RootLoaderType = Route.ComponentProps["loaderData"];

export function useRootLoaderData(): RootLoaderType {
  return useRouteLoaderData("root")!;
}
