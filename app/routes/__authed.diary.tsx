import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  SerializeFrom,
} from "@remix-run/node";
import DiaryEntryDeleteAll from "~/modules/Diary/DiaryEntryDeleteAll";
import DiaryEntryForm from "~/modules/Diary/DiaryEntryForm";
import DiaryList from "~/modules/Diary/DiaryList";
import DiaryNavigation from "~/modules/Diary/DiaryNavigation";
import DiaryTotals from "~/modules/Diary/DiaryTotals";
import { userIdFromRequest } from "~/server/auth.server";
import {
  createEntry,
  deleteAllEntries,
  deleteEntry,
  getAggregateEntriesForDay,
  getEntriesForDay,
} from "~/server/data/foodEntries.server";

export type DiaryRouteData = SerializeFrom<typeof loader>;

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const date = new URL(request.url).searchParams.get("date") ?? undefined;
  const userId = await userIdFromRequest(request);
  const entries = await getEntriesForDay(userId, date);
  const entriesTotals = await getAggregateEntriesForDay(userId, date);

  return {
    entriesForToday: entries,
    entriesTotals,
    unparsedDate: date,
  };
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
  return (
    <>
      <main className="max-w-xl w-full mx-auto flex-grow overflow-hidden flex flex-col mb-4">
        <DiaryNavigation />

        <DiaryTotals />

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
