import { useState } from "react";
import { useSearchParams } from "react-router";
import DiaryDailySummary from "~/modules/Diary/DiaryDailySummary";
import DiaryEntryForm from "~/modules/Diary/DiaryEntryForm";
import DiaryList from "~/modules/Diary/DiaryList";
import DiaryNavigation from "~/modules/Diary/DiaryNavigation";
import { trpc } from "~/utils/trpc";

export const meta = () => [
  {
    title: "Diary | AI Food Log",
  },
];

export default function NotesPage() {
  const [searchParams] = useSearchParams();

  const [today] = useState(new Date().toISOString());
  const date = searchParams.get("date") ?? today;

  const { data: entries, isLoading: entriesLoading } =
    trpc.food.getEntriesForDay.useQuery({ date });
  const { data: totals, isLoading: totalsLoading } =
    trpc.food.getAggregateForDay.useQuery({ date });

  if (entriesLoading || totalsLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">Loading diary...</div>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col items-center">
        <DiaryNavigation />
      </div>

      <DiaryEntryForm date={date} />

      <DiaryDailySummary totals={totals} />

      <DiaryList entries={entries || []} />
    </>
  );
}
