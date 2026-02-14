import { useState } from "react";
import { Sparkles, Plus } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { useToast } from "~/hooks/use-toast";
import { trpc } from "~/utils/trpc";

interface DiaryAISuggestionProps {
  date: string;
}

interface SuggestedMeal {
  description: string;
}

export function DiaryAISuggestion({ date }: DiaryAISuggestionProps) {
  const { toast } = useToast();
  const utils = trpc.useUtils();
  const [prompt, setPrompt] = useState("");
  const [suggestedMeals, setSuggestedMeals] = useState<SuggestedMeal[]>([]);
  const [addingIndex, setAddingIndex] = useState<number | null>(null);

  const generateSuggestion = trpc.food.generateMealSuggestion.useMutation({
    onSuccess: (data) => {
      setSuggestedMeals(data.meals);
    },
    onError: (error) => {
      toast({
        title: "Failed to generate suggestion",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const createEntry = trpc.food.createEntry.useMutation({
    onSuccess: () => {
      utils.food.getEntriesForDay.invalidate();
      utils.food.getAggregateForDay.invalidate();
      setAddingIndex(null);
      toast({
        title: "Meal added successfully",
      });
    },
    onError: (error) => {
      setAddingIndex(null);
      toast({
        title: "Failed to add meal",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleGenerateSuggestion = () => {
    generateSuggestion.mutate({ date, prompt: prompt.trim() || undefined });
  };

  const handleAddMeal = (mealDescription: string, index: number) => {
    setAddingIndex(index);
    createEntry.mutate({
      content: mealDescription,
      day: date,
    });
  };

  const handleAddAllMeals = async () => {
    for (let i = 0; i < suggestedMeals.length; i++) {
      setAddingIndex(i);
      await new Promise<void>((resolve) => {
        createEntry.mutate(
          {
            content: suggestedMeals[i].description,
            day: date,
          },
          {
            onSettled: () => resolve(),
          },
        );
      });
    }
    setSuggestedMeals([]);
    setPrompt("");
  };

  const handleClear = () => {
    setSuggestedMeals([]);
    setPrompt("");
  };

  return (
    <div className="space-y-4">
      {suggestedMeals.length === 0 ? (
        <>
          <div className="grid w-full gap-1.5">
            <Label htmlFor="ai-prompt">What would you like?</Label>
            <Input
              id="ai-prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. What can I have for lunch? I have chicken and rice"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !generateSuggestion.isPending) {
                  handleGenerateSuggestion();
                }
              }}
            />
            <p className="text-xs text-muted-foreground">
              Try: &quot;What can I have for lunch?&quot; or &quot;Plan 3 meals
              for today&quot;
            </p>
          </div>
          <Button
            onClick={handleGenerateSuggestion}
            isLoading={generateSuggestion.isPending}
            className="w-full gap-2"
          >
            <Sparkles className="h-4 w-4" />
            Generate Suggestions
          </Button>
        </>
      ) : (
        <div className="space-y-3">
          <div className="space-y-2">
            {suggestedMeals.map((meal, index) => (
              <div
                key={index}
                className="rounded-lg border bg-card p-4 space-y-2"
              >
                {suggestedMeals.length > 1 && (
                  <h3 className="text-sm font-medium">
                    Meal {index + 1} of {suggestedMeals.length}
                  </h3>
                )}
                <p className="text-sm text-muted-foreground">
                  {meal.description}
                </p>
                <Button
                  onClick={() => handleAddMeal(meal.description, index)}
                  isLoading={addingIndex === index}
                  disabled={addingIndex !== null}
                  size="sm"
                  className="gap-1"
                >
                  <Plus className="h-3 w-3" />
                  Add This Meal
                </Button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            {suggestedMeals.length > 1 && (
              <Button
                onClick={handleAddAllMeals}
                disabled={addingIndex !== null}
                className="flex-1"
              >
                Add All {suggestedMeals.length} Meals
              </Button>
            )}
            <Button
              onClick={handleClear}
              variant="outline"
              disabled={addingIndex !== null}
              className={suggestedMeals.length > 1 ? "" : "flex-1"}
            >
              Clear
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
