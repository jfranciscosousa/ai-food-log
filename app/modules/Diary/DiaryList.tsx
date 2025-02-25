import { useLoaderData } from "react-router";
import { type DiaryRouteData } from "~/routes/__authed.diary";
import DiaryEntry from "./DIaryEntry";

export default function DiaryList() {
  const { entriesForToday } = useLoaderData<DiaryRouteData>();

  return (
    <div className="flex flex-col gap-4 ">
      {entriesForToday.map((entry) => (
        <DiaryEntry key={entry.id} entry={entry} />
      ))}
    </div>
  );
}
