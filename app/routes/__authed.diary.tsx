import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  SerializeFrom,
} from "@remix-run/node";
import { useFetcher, useLoaderData } from "@remix-run/react";
import { useEffect } from "react";
import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { useToast } from "~/components/ui/use-toast";
import {
  createEntry,
  deleteAllEntries,
  deleteEntry,
  getAggregateEntriesForDay,
  getEntriesForDay,
} from "~/data/foodEntries.server";
import DiaryEntryDeleteAll from "~/modules/Diary/DiaryEntryDeleteAll";
import DiaryEntryForm from "~/modules/Diary/DiaryEntryForm";
import DiaryList from "~/modules/Diary/DiaryList";
import DiaryNavigation from "~/modules/Diary/DiaryNavigation";
import { userIdFromRequest } from "~/web/auth.server";

export type DiaryRouteData = SerializeFrom<typeof loader>;

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const date = new Date(
    new URL(request.url).searchParams.get("date") || new Date(),
  );
  const userId = await userIdFromRequest(request);
  const entries = await getEntriesForDay(userId, date);
  const entriesTotals = await getAggregateEntriesForDay(userId, date);

  return { entriesForToday: entries, entriesTotals, unparsedDate: date };
};

export type DiaryActionData = SerializeFrom<typeof action>;

export const action = async ({ request }: ActionFunctionArgs) => {
  const userId = await userIdFromRequest(request);
  const formData = await request.formData();
  const form = Object.fromEntries(formData);

  try {
    switch (form._action) {
      case "create":
        return {
          _action: "create" as const,
          ...(await createEntry(userId, formData)),
        };
      case "delete":
        return {
          _action: "delete" as const,
          ...(await deleteEntry(userId, formData)),
        };
      case "delete-all":
        return {
          _action: "delete-all" as const,
          ...(await deleteAllEntries(userId, formData)),
        };
    }
  } catch (_error) {
    return { _action: form._action, errors: { content: "unknown" } };
  }
};

export default function NotesPage() {
  const { toast } = useToast();
  const { entriesTotals } = useLoaderData<DiaryRouteData>();
  const fetcher = useFetcher<DiaryActionData>();

  useEffect(() => {
    if (fetcher.data?._action === "delete" && fetcher.data?.errors) {
      toast({
        title: "Unhandled error while deleting entry!",
        variant: "destructive",
      });
    }
  }, [fetcher.data, toast]);

  return (
    <>
      <main className="max-w-xl w-full mx-auto flex-grow overflow-hidden flex flex-col">
        <DiaryNavigation />

        <Card>
          <CardHeader>Totals</CardHeader>

          <CardContent>
            {entriesTotals.calories} calories, {entriesTotals.protein}g protein,{" "}
            {entriesTotals.carbs}g carbs, {entriesTotals.fat}g fat,
            {entriesTotals.fiber}g fiber
          </CardContent>
        </Card>

        <div className="my-8 h-[1px] border" />

        <DiaryList />
      </main>

      <DiaryEntryDeleteAll />

      <div className="shrink-0 max-w-xl w-full mx-auto py-8">
        <DiaryEntryForm />
      </div>
    </>
  );
}
