import { Edit2 } from "lucide-react";
import { useState } from "react";
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
import { toast } from "sonner";
import { trpc } from "~/utils/trpc";

interface UpdateMealModalProps {
  entryId: string;
  entryContent: string;
}

function Form({
  entryId,
  entryContent,
  setOpen,
}: UpdateMealModalProps & { setOpen: (open: boolean) => void }) {
  const [content, setContent] = useState(entryContent);
  const utils = trpc.useUtils();

  const updateEntry = trpc.food.updateEntry.useMutation({
    onSuccess: () => {
      utils.food.getEntriesForDay.invalidate();
      utils.food.getAggregateForDay.invalidate();
      toast.success("Entry updated successfully.");
      setOpen(false);
    },
    onError: (error) => {
      toast.error("Failed to update entry", {
        description: error.message,
      });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    updateEntry.mutate({
      id: entryId,
      content,
    });
  };

  return (
    <form onSubmit={handleSubmit}>
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
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="py-6"
      />

      <AlertDialogFooter>
        <AlertDialogCancel type="button">Cancel</AlertDialogCancel>
        <Button type="submit" isLoading={updateEntry.isPending}>
          Save Changes
        </Button>
      </AlertDialogFooter>
    </form>
  );
}

export function DiaryEntryUpdate(props: UpdateMealModalProps) {
  const [open, setOpen] = useState(false);

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setOpen(true)}
          >
            <Edit2 className="h-4 w-4" />
          </Button>
        }
      />
      <AlertDialogContent>
        {open && <Form {...props} setOpen={setOpen} />}
      </AlertDialogContent>
    </AlertDialog>
  );
}
