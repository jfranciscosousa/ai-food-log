import { EyeIcon } from "lucide-react";
import { Card, CardContent, CardHeader } from "~/components/ui/card";
import DiaryEntryDeleteOne from "./DiaryEntryDeleteOne";
import { type DiaryRouteData } from "~/routes/__authed.diary";
import { useState } from "react";

type Props = {
  entry: DiaryRouteData["entriesForToday"][number];
};

export default function DiaryEntry({ entry }: Props) {
  const [expanded, setExpanded] = useState(false);

  function handleExpand() {
    setExpanded(!expanded);
  }

  return (
    <Card key={entry.id}>
      <CardHeader className="flex flex-row items-center justify-between">
        <span>{entry.name}</span>

        <div className="flex gap-8">
          <button
            type="button"
            onClick={handleExpand}
            aria-hidden="true"
            className="p-4 -m-4"
          >
            <EyeIcon width="16px" />
          </button>

          <DiaryEntryDeleteOne entryId={entry.id} />
        </div>
      </CardHeader>

      <CardContent>
        {expanded && (
          <div>
            <p className="mb-2">Original prompt: {entry.content}</p>

            <ul className="pb-4">
              {entry.items.map((item) => (
                <li key={item.id} className="list-disc ml-4">
                  {item.name}, {item.calories} calories, {item.protein}g
                  protein, {item.carbs}g carbs, {item.fat}g fat, {item.fiber}g
                  fiber
                </li>
              ))}
            </ul>
          </div>
        )}

        <p>
          Totals: {entry.calories} calories, {entry.protein}g protein,{" "}
          {entry.carbs}g carbs, {entry.fat}g fat, {entry.fiber}g fiber
        </p>
      </CardContent>
    </Card>
  );
}
