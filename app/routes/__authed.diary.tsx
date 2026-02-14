import { useState } from "react";
import { useSearchParams } from "react-router";
import DiaryDailySummary from "~/domains/Diary/DiaryDailySummary";
import DiaryEntryForm from "~/domains/Diary/DiaryEntryForm";
import DiaryList from "~/domains/Diary/DiaryList";
import DiaryNavigation from "~/domains/Diary/DiaryNavigation";

export const meta = () => [
  {
    title: "Diary | AI Food Log",
  },
];

export default function NotesPage() {
  const [searchParams] = useSearchParams();

  const [today] = useState(new Date().toISOString());
  const date = searchParams.get("date") ?? today;

  return (
    <>
      <div className="flex flex-col items-center">
        <DiaryNavigation />
      </div>

      <DiaryEntryForm date={date} />

      <DiaryDailySummary date={date} />

      <DiaryList date={date} />
    </>
  );
}
