import { useRef, useState } from "react";
import { Camera } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { toast } from "sonner";
import { trpc } from "~/utils/trpc";
import { DiaryAISuggestion } from "./DiaryAISuggestion";

interface DiaryEntryFormProps {
  date: string;
}

export default function DiaryEntryForm({ date }: DiaryEntryFormProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const inputImageRef = useRef<HTMLInputElement>(null);
  const utils = trpc.useUtils();
  const [activeTab, setActiveTab] = useState("manual");

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
      toast.error("Failed to create entry", {
        description: error.message,
      });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const content = formData.get("content") as string;

    if (!content?.trim()) {
      toast.error("Please enter a meal description");
      return;
    }

    createEntry.mutate({
      content,
      day: date,
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check if it's an image
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Convert to base64
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      createEntry.mutate({
        imageBase64: base64,
        day: date,
      });
    };
    reader.onerror = () => {
      toast.error("Failed to read image");
    };
    reader.readAsDataURL(file);

    // Reset the input so the same file can be selected again
    e.target.value = "";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Meal</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex flex-col"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="manual">Manual Entry</TabsTrigger>
            <TabsTrigger value="ai">AI Suggestion</TabsTrigger>
          </TabsList>

          <TabsContent value="manual" className="mt-4">
            <form onSubmit={handleSubmit}>
              <div className="flex flex-col gap-4">
                <div className="grid w-full gap-1.5">
                  <Label htmlFor="meal">Meal Description</Label>
                  <div className="flex gap-2">
                    <Input
                      id="meal"
                      name="content"
                      placeholder="e.g. 100g of cooked rice and 250g of raw chicken breast"
                      ref={inputRef}
                    />
                    <input
                      ref={inputImageRef}
                      className="hidden"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => inputImageRef.current?.click()}
                      isLoading={createEntry.isPending}
                      disabled={createEntry.isPending}
                    >
                      <Camera />
                    </Button>
                    <Button type="submit" isLoading={createEntry.isPending}>
                      Add
                    </Button>
                  </div>
                </div>
              </div>
            </form>
          </TabsContent>

          <TabsContent value="ai" className="mt-4">
            <DiaryAISuggestion date={date} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
