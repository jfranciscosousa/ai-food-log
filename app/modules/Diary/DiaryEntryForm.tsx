import { useRef } from "react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { useToast } from "~/hooks/use-toast";
import { trpc } from "~/utils/trpc";

interface DiaryEntryFormProps {
  date: string;
}

export default function DiaryEntryForm({ date }: DiaryEntryFormProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const utils = trpc.useUtils();

  const createEntry = trpc.food.createEntry.useMutation({
    onSuccess: () => {
      utils.food.getEntriesForDay.invalidate();
      utils.food.getAggregateForDay.invalidate();
      if (inputRef.current) {
        inputRef.current.value = "";
        inputRef.current.focus();
      }
    },
    onError: (error) => {
      toast({
        title: "Failed to create entry",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const content = formData.get("content") as string;

    if (!content?.trim()) {
      toast({
        title: "Please enter a meal description",
        variant: "destructive",
      });
      return;
    }

    createEntry.mutate({
      content,
      day: date,
    });
  };

  return (
    <form onSubmit={handleSubmit}>
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
                <Button type="submit" isLoading={createEntry.isPending}>
                  Add
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
