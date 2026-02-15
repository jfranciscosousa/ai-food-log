import { Trash2 } from "lucide-react";
import { Button } from "~/components/ui/button";
import { toast } from "sonner";
import { trpc } from "~/utils/trpc";

type Props = {
  entryId: string;
};

export default function DiaryEntryDeleteOne({ entryId }: Props) {
  const utils = trpc.useUtils();

  const deleteEntry = trpc.food.deleteEntry.useMutation({
    onSuccess: () => {
      utils.food.getEntriesForDay.invalidate();
      utils.food.getAggregateForDay.invalidate();
    },
    onError: (error) => {
      toast.error("Failed to delete entry", {
        description: error.message,
      });
    },
  });

  const handleDelete = () => {
    deleteEntry.mutate({ id: entryId });
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-8 w-8"
      onClick={handleDelete}
      aria-label="Delete entry"
      isLoading={deleteEntry.isPending}
    >
      <Trash2 className="h-4 w-4" />
      <span className="sr-only">Delete entry</span>
    </Button>
  );
}
