import { useFetcher } from "@remix-run/react";
import { cn } from "~/utils";

type Props = {
  entryId: string;
};

export default function DiaryEntryDeleteOne({ entryId }: Props) {
  const fetcher = useFetcher();

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
      >
        X
      </button>
    </fetcher.Form>
  );
}
