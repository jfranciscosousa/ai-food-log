import { useLoaderData } from "@remix-run/react";
import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { ScrollArea } from "~/components/ui/scroll-area";
import { DiaryRouteData } from "~/routes/__authed.diary";
import DiaryEntryDeleteOne from "./DiaryEntryDeleteOne";

export default function DiaryList() {
  const { entriesForToday } = useLoaderData<DiaryRouteData>();

  return (
    <ScrollArea className="max-h-full h-full">
      <div className="flex flex-col gap-4 ">
        {entriesForToday.map((entry) => (
          <Card key={entry.id}>
            <CardHeader className="flex flex-row items-center justify-between">
              <span>{entry.name}</span>

              <DiaryEntryDeleteOne entryId={entry.id} />
            </CardHeader>

            <CardContent>
              {entry.calories} calories, {entry.protein}g protein, {entry.carbs}
              g carbs, {entry.fiber}g fiber
            </CardContent>
          </Card>
        ))}
      </div>
    </ScrollArea>
  );
}
