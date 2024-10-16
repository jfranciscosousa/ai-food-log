import { useFetcher, useLoaderData } from "@remix-run/react";
import { useEffect } from "react";
import { Button } from "~/components/ui/button";
import { useToast } from "~/hooks/use-toast";
import { DiaryActionData, DiaryRouteData } from "~/routes/__authed.diary";

export default function DiaryEntryDeleteAll() {
  const { toast } = useToast();
  const { unparsedDate } = useLoaderData<DiaryRouteData>();
  const fetcher = useFetcher<DiaryActionData>();

  useEffect(() => {
    if (fetcher.data?.errors) {
      toast({
        title: "Unhandled error while deleting all entries!",
        variant: "destructive",
      });
    }
  }, [fetcher.data, toast]);

  return (
    <fetcher.Form
      method="post"
      className="flex flex-col items-center justify-center"
    >
      <input type="hidden" name="day" value={unparsedDate} />

      <Button
        variant="destructive"
        type="submit"
        name="_action"
        value="delete-all"
        aria-label="Delete all notes"
        isLoading={fetcher.state === "submitting"}
      >
        Delete all
      </Button>
    </fetcher.Form>
  );
}
