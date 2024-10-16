import { useFetcher } from "@remix-run/react";
import { useEffect } from "react";
import { useToast } from "~/hooks/use-toast";
import { DiaryActionData } from "~/routes/__authed.diary";
import { cn } from "~/utils";
import { Trash2Icon } from "lucide-react";

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
      <input type="hidden" name="id" value={entryId} />

      <button
        type="submit"
        name="_action"
        value="delete"
        aria-label="Delete entry"
        disabled={fetcher.state === "submitting"}
        className="p-4 -m-4"
      >
        <Trash2Icon width="16px" aria-hidden="true" />
      </button>
    </fetcher.Form>
  );
}
