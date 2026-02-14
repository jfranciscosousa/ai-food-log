import { format } from "date-fns";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { useSearchParams } from "react-router";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog";
import { Button } from "~/components/ui/button";
import { toast } from "~/hooks/use-toast";
import { trpc } from "~/utils/trpc";

export function DiaryClearDay() {
  const [open, setOpen] = useState(false);
  const [searchParams] = useSearchParams();
  const date = searchParams.get("date") ?? new Date().toISOString();
  const formattedDate = format(date, "MMMM d, yyyy");
  const utils = trpc.useUtils();

  const deleteAll = trpc.food.deleteAllEntries.useMutation({
    onSuccess: () => {
      utils.food.getEntriesForDay.invalidate();
      utils.food.getAggregateForDay.invalidate();
      toast({
        title: "All entries cleared for the day.",
      });
      setOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Failed to clear entries",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleDelete = () => {
    deleteAll.mutate({ day: date });
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="sm" className="gap-2">
          <Trash2 className="h-4 w-4" />
          Clear Day
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Clear all meals</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete all meals for {formattedDate}? This
            action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <Button
            variant="destructive"
            onClick={handleDelete}
            isLoading={deleteAll.isPending}
          >
            Delete all
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
