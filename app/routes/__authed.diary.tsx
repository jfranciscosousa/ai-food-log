import { useState } from "react";
import { useSearchParams } from "react-router";
import DiaryDailySummary from "~/domains/Diary/DiaryDailySummary";
import DiaryEntryForm from "~/domains/Diary/DiaryEntryForm";
import DiaryList from "~/domains/Diary/DiaryList";
import DiaryNavigation from "~/domains/Diary/DiaryNavigation";

export const meta = () => [
  {
    title: "Diary | Vigor",
  },
];

export default function NotesPage() {
  const [searchParams] = useSearchParams();

  const [today] = useState(new Date().toISOString());
  const date = searchParams.get("date") ?? today;

  return (
    <div className="flex flex-col gap-6">
      {/* Header Section */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Food Diary</h1>
        <p className="text-muted-foreground">
          Track your daily nutrition and reach your health goals
        </p>
      </div>

      <div className="flex flex-col items-center">
        <DiaryNavigation />
      </div>

      <DiaryEntryForm date={date} />

      <DiaryDailySummary date={date} />

      <DiaryList date={date} />
    </div>
  );
}
