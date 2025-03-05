import { Edit2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useFetcher } from "react-router";
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
import { InputField } from "~/components/ui/input-field";
import { toast } from "~/hooks/use-toast";
import type { DiaryActionData } from "~/routes/__authed.diary";

interface UpdateMealModalProps {
  entryId: string;
  entryContent: string;
}

function Form({
  entryId,
  entryContent,
  setOpen,
}: UpdateMealModalProps & { setOpen: (open: boolean) => void }) {
  const fetcher = useFetcher<DiaryActionData>();
  const isUpdating = fetcher.state === "submitting";

  useEffect(() => {
    if (fetcher.data?._action !== "update") return;

    if (fetcher.data?.errors) {
      toast({
        title: "Unhandled error while creating entry!",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Entry updated successfully!",
      });
      setOpen(false);
    }
  }, [fetcher.data, setOpen]);

  return (
    <fetcher.Form method="POST">
      <AlertDialogHeader>
        <AlertDialogTitle>Edit meal prompt</AlertDialogTitle>
        <AlertDialogDescription>
          Make changes to the original meal prompt here. Click save when
          you&apos;re done.
        </AlertDialogDescription>
      </AlertDialogHeader>

      <InputField
        label="Meal description"
        name="content"
        defaultValue={entryContent}
        className="py-6"
      />
      <input type="hidden" name="id" value={entryId} />

      <AlertDialogFooter>
        <AlertDialogCancel type="button">Cancel</AlertDialogCancel>
        <Button
          type="submit"
          name="_action"
          value="update"
          isLoading={isUpdating}
        >
          Save Changes
        </Button>
      </AlertDialogFooter>
    </fetcher.Form>
  );
}

export function DiaryEntryUpdate(props: UpdateMealModalProps) {
  const [open, setOpen] = useState(false);

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => setOpen(true)}
        >
          <Edit2 className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        {open && <Form {...props} setOpen={setOpen} />}
      </AlertDialogContent>
    </AlertDialog>
  );
}
