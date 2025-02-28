"use client";

import { Trash2 } from "lucide-react";
import { Button, buttonVariants } from "~/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog";
import { format } from "date-fns";
import { useFetcher, useLoaderData } from "react-router";
import type { DiaryRouteData } from "~/routes/__authed.diary";

export function DiaryClearDay() {
  const fetcher = useFetcher();
  const { unparsedDate } = useLoaderData<DiaryRouteData>();
  const formattedDate = format(unparsedDate, "MMMM d, yyyy");

  return (
    <AlertDialog>
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
          <AlertDialogAction
            className={buttonVariants({ variant: "destructive" })}
            asChild
          >
            <fetcher.Form
              method="post"
              className="flex flex-col items-center justify-center"
            >
              <input type="hidden" name="day" value={unparsedDate} />
              Delete all
            </fetcher.Form>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
