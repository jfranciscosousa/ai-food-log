import { useFetcher, useLoaderData } from "react-router";
import { useEffect, useRef } from "react";
import { Button } from "~/components/ui/button";
import { useToast } from "~/hooks/use-toast";
import { formatDate } from "~/hooks/useDates";
import { useIsClient } from "~/hooks/useIsClient";
import {
  type DiaryActionData,
  type DiaryRouteData,
} from "~/routes/__authed.diary";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Label } from "~/components/ui/label";
import { Input } from "~/components/ui/input";

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
    <fetcher.Form method="post">
      <Card>
        <CardHeader>
          <CardTitle>Add Meal</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <div className="grid w-full gap-1.5">
              <Label htmlFor="meal">Meal Description</Label>
              <div className="flex gap-2">
                <Input
                  name="content"
                  placeholder="e.g. 100g of cooked rice and 250g of raw chicken breast"
                  ref={inputRef}
                />
                <Button
                  type="submit"
                  isLoading={isAdding}
                  name="_action"
                  value="create"
                >
                  Add
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
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
