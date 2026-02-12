import DiaryEntry from "./DiaryEntry";
import type { FoodEntry, FoodEntryItem } from "@prisma/client";

interface DiaryListProps {
  entries: (FoodEntry & { items: FoodEntryItem[] })[];
}

export default function DiaryList({ entries }: DiaryListProps) {
  return (
    <div className="flex flex-col gap-4 ">
      {entries.map((entry) => (
        <DiaryEntry key={entry.id} entry={entry} />
      ))}
    </div>
  );
}
