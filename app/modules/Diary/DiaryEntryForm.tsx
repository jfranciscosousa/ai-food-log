import { Camera } from "lucide-react";
import { useEffect, useRef, type ChangeEvent } from "react";
import { useFetcher, useLoaderData } from "react-router";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { formatDate } from "~/hooks/useDates";
import { useIsClient } from "~/hooks/useIsClient";
import {
  type DiaryActionData,
  type DiaryRouteData,
} from "~/routes/__authed.diary";

export default function DiaryEntryForm() {
  const { unparsedDate } = useLoaderData<DiaryRouteData>();
  const fetcher = useFetcher<DiaryActionData>();
  const inputRef = useRef<HTMLInputElement>(null);
  const inputImageRef = useRef<HTMLInputElement>(null);

  const isAdding =
    fetcher.state === "submitting" &&
    fetcher.formData?.get("_action") === "create";
  const isClient = useIsClient();

  useEffect(() => {
    if (!isAdding || !inputRef.current) return;

    inputRef.current.value = "";
    inputRef.current.focus();
  }, [isAdding]);

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    fetcher.submit(event.target.form, {
      method: "POST",
      encType: "multipart/form-data",
    });
  }

  return (
    <fetcher.Form method="post" encType="multipart/form-data">
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
                <input
                  ref={inputImageRef}
                  className="hidden"
                  type="file"
                  name="image"
                  accept="image/*"
                  onChange={handleFileChange}
                />
                <input type="hidden" name="_action" value="create" />

                <Button type="button" isLoading={isAdding}>
                  <Camera onClick={() => inputImageRef.current?.click()} />
                </Button>
                <Button type="submit" isLoading={isAdding}>
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
