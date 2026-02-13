import { Loader2, UtensilsCrossed } from "lucide-react";
import DiaryEntry from "./DiaryEntry";
import { trpc } from "~/utils/trpc";

interface DiaryListProps {
  date: string;
}

export default function DiaryList({ date }: DiaryListProps) {
  const { data: entries, isLoading } = trpc.food.getEntriesForDay.useQuery({
    date,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!entries || entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed p-12 text-center">
        <UtensilsCrossed className="h-12 w-12 text-muted-foreground" />
        <div className="space-y-1">
          <h3 className="font-semibold">No meals yet</h3>
          <p className="text-sm text-muted-foreground">
            Add your first meal using the form above
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 ">
      {entries.map((entry) => (
        <DiaryEntry key={entry.id} entry={entry} />
      ))}
    </div>
  );
}
