import { Trash2 } from "lucide-react";
import { useEffect } from "react";
import { useFetcher } from "react-router";
import { Button } from "~/components/ui/button";
import { useToast } from "~/hooks/use-toast";
import { type DiaryActionData } from "~/routes/__authed.diary";
import { cn } from "~/utils";

type Props = {
  entryId: string;
};

export default function DiaryEntryDeleteOne({ entryId }: Props) {
  const { toast } = useToast();
  const fetcher = useFetcher<DiaryActionData>();

  useEffect(() => {
    if (fetcher.data?._action === "delete" && fetcher.data?.errors) {
      toast({
        title: "Unhandled error while deleting entry!",
        variant: "destructive",
      });
    }
  }, [fetcher.data, toast]);

  return (
    <fetcher.Form
      method="post"
      className={cn(
        "flex flex-col items-center justify-center",
        fetcher.state === "submitting" ? "cursor-not-allowed" : "",
      )}
    >
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        type="submit"
        name="_action"
        value="delete"
        aria-label="Delete entry"
        isLoading={fetcher.state === "submitting"}
      >
        <Trash2 className="h-4 w-4" />
        <span className="sr-only">Delete entry</span>
      </Button>

      <input type="hidden" name="id" value={entryId} />
    </fetcher.Form>
  );
}
