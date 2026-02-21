import { Sparkles } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Textarea } from "~/components/ui/textarea";
import { trpc } from "~/utils/trpc";

interface WorkoutPlanFormProps {
  date: string;
}

export default function WorkoutPlanForm({ date }: WorkoutPlanFormProps) {
  const utils = trpc.useUtils();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [aiPrompt, setAiPrompt] = useState("");

  function invalidate() {
    utils.workout.getPlanForDay.invalidate({ date });
  }

  const createManual = trpc.workout.createManualPlan.useMutation({
    onSuccess: () => {
      invalidate();
      if (textareaRef.current) textareaRef.current.value = "";
    },
    onError: (err) =>
      toast.error("Failed to save plan", { description: err.message }),
  });

  const generateAI = trpc.workout.generateAIPlan.useMutation({
    onSuccess: () => {
      invalidate();
      setAiPrompt("");
    },
    onError: (err) =>
      toast.error("Failed to generate plan", { description: err.message }),
  });

  function handleManualSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const content = new FormData(e.currentTarget).get("content") as string;
    if (!content?.trim()) return;
    createManual.mutate({ content, day: date });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Plan Workout</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="ai" className="flex flex-col">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="ai">AI Suggestion</TabsTrigger>
            <TabsTrigger value="manual">Write Manually</TabsTrigger>
          </TabsList>

          <TabsContent value="ai" className="mt-4 space-y-3">
            <div className="grid gap-1.5">
              <Label htmlFor="ai-prompt">What kind of workout?</Label>
              <Input
                id="ai-prompt"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="e.g. 30 min upper body, no equipment HIIT, leg day…"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !generateAI.isPending)
                    generateAI.mutate({
                      day: date,
                      prompt: aiPrompt || undefined,
                    });
                }}
              />
              <p className="text-xs text-muted-foreground">
                Leave blank to get a suggestion based on your fitness level and
                goals.
              </p>
            </div>
            <Button
              className="w-full gap-2"
              isLoading={generateAI.isPending}
              onClick={() =>
                generateAI.mutate({ day: date, prompt: aiPrompt || undefined })
              }
            >
              <Sparkles className="h-4 w-4" />
              Generate Plan
            </Button>
          </TabsContent>

          <TabsContent value="manual" className="mt-4">
            <form onSubmit={handleManualSubmit} className="space-y-3">
              <div className="grid gap-1.5">
                <Label htmlFor="content">Describe your workout</Label>
                <Textarea
                  ref={textareaRef}
                  id="content"
                  name="content"
                  placeholder="e.g. 3x10 bench press, 3x12 rows, 20 min treadmill…"
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                isLoading={createManual.isPending}
              >
                Save Plan
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
