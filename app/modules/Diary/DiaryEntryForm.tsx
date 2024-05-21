import { useFetcher, useLoaderData } from "@remix-run/react";
import { useEffect, useRef } from "react";
import { Button } from "~/components/ui/button";
import { InputField } from "~/components/ui/input-field";
import { useToast } from "~/components/ui/use-toast";
import { formatDate } from "~/hooks/useDates";
import { useIsClient } from "~/hooks/useIsClient";
import { DiaryActionData, DiaryRouteData } from "~/routes/__authed.diary";

export default function DiaryEntryForm() {
  const { toast } = useToast();
  const { unparsedDate } = useLoaderData<DiaryRouteData>();
  const fetcher = useFetcher<DiaryActionData>();
  const inputRef = useRef<HTMLInputElement>(null);
  const isAdding =
    fetcher.state === "submitting" &&
    fetcher.formData?.get("_action") === "create";
  const isClient = useIsClient();

  useEffect(() => {
    if (fetcher.data?.errors) {
      toast({
        title: "Unhandled error while creating entry!",
        variant: "destructive",
      });
    }
  }, [fetcher.data, toast]);

  useEffect(() => {
    if (!isAdding || !inputRef.current) return;

    inputRef.current.value = "";
    inputRef.current.focus();
  }, [isAdding]);

  return (
    <fetcher.Form method="post" className="flex flex-col space-y-4">
      <div className="flex flex-row items-end space-x-4 w-full">
        <InputField
          label="New entry"
          name="content"
          type="text"
          required
          ref={inputRef}
          className="w-full"
          inputClassName="input-bordered"
        />

        <Button
          type="submit"
          isLoading={fetcher.state === "submitting"}
          name="_action"
          value="create"
          className="w-[120px]"
        >
          Submit
        </Button>
      </div>

      {!isClient && <input type="hidden" name="day" value={unparsedDate} />}
      {isClient && (
        <input
          type="hidden"
          name="day"
          value={unparsedDate || formatDate(new Date())}
        />
      )}
    </fetcher.Form>
  );
}
