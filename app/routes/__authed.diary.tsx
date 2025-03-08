import type { LoaderFunctionArgs } from "react-router";
import { toast } from "~/hooks/use-toast";
import DiaryDailySummary from "~/modules/Diary/DiaryDailySummary";
import DiaryEntryForm from "~/modules/Diary/DiaryEntryForm";
import DiaryList from "~/modules/Diary/DiaryList";
import DiaryNavigation from "~/modules/Diary/DiaryNavigation";
import { userIdFromRequest } from "~/server/auth.server";
import type { Info, Route } from "./+types/__authed.diary";
import { FoodService } from "~/server/data/food.server";

export type DiaryRouteData = Info["loaderData"];

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const date =
    new URL(request.url).searchParams.get("date") ?? new Date().toISOString();
  const userId = await userIdFromRequest(request);
  const entries = await FoodService.getEntriesForDay(userId, date);
  const entriesTotals = await FoodService.getAggregateForDay(userId, date);

  return {
    entriesForToday: entries,
    entriesTotals,
    unparsedDate: date,
  };
};

export type DiaryActionData = Info["actionData"];

export const action = async ({ request }: Route.ActionArgs) => {
  const userId = await userIdFromRequest(request);
  const formData = await request.formData();
  const form = Object.fromEntries(formData);

  try {
    switch (form._action) {
      case "create":
        return {
          _action: "create" as const,
          ...(await FoodService.createEntry(userId, formData)),
        };
      case "update":
        return {
          _action: "update" as const,
          ...(await FoodService.updateEntry(userId, formData)),
        };
      case "delete":
        return {
          _action: "delete" as const,
          ...(await FoodService.deleteEntry(userId, formData)),
        };
      case "delete-all":
        return {
          _action: "delete-all" as const,
          ...(await FoodService.deleteAllEntries(userId, formData)),
        };
    }
  } catch (_error) {
    return { _action: form._action, errors: { content: "unknown" } };
  }
};

export async function clientAction(args: Route.ClientActionArgs) {
  const result = await args.serverAction();

  if (result?.errors) {
    toast({
      title: "Unhandled error!",
      variant: "destructive",
    });
  }

  return result;
}

export default function NotesPage() {
  return (
    <>
      <div className="flex flex-col items-center">
        <DiaryNavigation />
      </div>

      <DiaryEntryForm />

      <DiaryDailySummary />

      <DiaryList />
    </>
  );
}
