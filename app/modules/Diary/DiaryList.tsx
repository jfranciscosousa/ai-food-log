import { useLoaderData } from "@remix-run/react";
import { ScrollArea } from "~/components/ui/scroll-area";
import { DiaryRouteData } from "~/routes/__authed.diary";
import DiaryEntry from "./DIaryEntry";

export default function DiaryList() {
  const { entriesForToday } = useLoaderData<DiaryRouteData>();

  return (
    <ScrollArea className="max-h-full h-full">
      <div className="flex flex-col gap-4 ">
        {entriesForToday.map((entry) => (
          <DiaryEntry key={entry.id} entry={entry} />
        ))}
      </div>
    </ScrollArea>
  );
}
