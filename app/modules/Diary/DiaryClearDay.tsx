import { format } from "date-fns";
import { Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useFetcher, useLoaderData } from "react-router";
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
import type { DiaryRouteData } from "~/routes/__authed.diary";

export function DiaryClearDay() {
  const [open, setOpen] = useState(false);
  const fetcher = useFetcher();
  const { unparsedDate } = useLoaderData<DiaryRouteData>();
  const formattedDate = format(unparsedDate, "MMMM d, yyyy");

  useEffect(() => {
    if (fetcher.data?._action !== "delete-all") return;

    if (!fetcher.data?.errors) {
      toast({
        title: "All entries cleared for the day.",
      });
      setOpen(false);
    }
  }, [fetcher.data, setOpen]);

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
          <fetcher.Form method="POST">
            <Button
              variant="destructive"
              type="submit"
              name="_action"
              value="delete-all"
              isLoading={fetcher.state !== "idle"}
            >
              <input type="hidden" name="day" value={unparsedDate} />
              Delete all
            </Button>
          </fetcher.Form>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
