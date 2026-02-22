import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import DiaryEntry from "~/domains/Diary/DiaryEntry";
import { trpc } from "~/utils/trpc";
import { formatDate } from "~/hooks/useDates";
import { Calendar } from "~/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { CalendarIcon, Plus, Search } from "lucide-react";
import { format } from "date-fns";
import { cn } from "~/utils";
import { toast } from "sonner";

export const meta = () => [
  {
    title: "Preview | Vigor",
  },
];

export default function Preview() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const input = searchParams.get("input") ?? "";
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const { data: entry, isLoading } = trpc.food.previewEntry.useQuery(
    { input },
    { enabled: !!input },
  );

  const utils = trpc.useUtils();
  const saveEntry = trpc.food.savePreviewEntry.useMutation({
    onSuccess: () => {
      utils.food.getEntriesForDay.invalidate();
      utils.food.getAggregateForDay.invalidate();
      const entryName = entry && entry.success ? entry.name : "Food entry";
      toast.success("Added to diary!", {
        description: `Successfully added "${entryName}" to ${format(selectedDate, "MMM d, yyyy")}`,
      });
      // Navigate to the diary for the selected date
      navigate(`/diary?date=${formatDate(selectedDate)}`);
    },
    onError: (error) => {
      toast.error("Failed to add to diary", {
        description: error.message,
      });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const inputValue = formData.get("input") as string;
    setSearchParams({ input: inputValue });
  };

  const handleSave = () => {
    if (!entry || !entry.success) return;

    saveEntry.mutate({
      content: entry.input,
      day: formatDate(selectedDate),
      name: entry.name,
      icon: entry.icon,
      items: entry.items,
    });
  };

  return (
    <main className="max-w-2xl w-full mx-auto grow flex flex-col gap-6 mb-4">
      {/* Header Section */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Food Preview</h1>
        <p className="text-muted-foreground">
          Preview nutritional information before adding to your diary
        </p>
      </div>

      {/* Search Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">What did you eat?</CardTitle>
          <CardDescription>
            Describe your meal and we&apos;ll analyze it for you
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="input">Food description</Label>
              <Input
                id="input"
                autoComplete="off"
                name="input"
                defaultValue={input}
                placeholder="e.g., 100g cooked rice and 250g chicken breast"
                className="text-base"
              />
            </div>
            <Button type="submit" isLoading={isLoading} className="w-full">
              <Search className="h-4 w-4 mr-2" />
              Analyze Food
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Error State */}
      {entry && !entry.success && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardHeader>
            <CardTitle className="text-destructive flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Unable to Process Input
            </CardTitle>
            <CardDescription>
              We couldn&apos;t process your food entry. Please try rephrasing
              your input or provide more details about what you ate.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              <span className="font-medium">Error:</span> {entry.error}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Success State - Preview Result */}
      {entry && entry.success && (
        <div className="space-y-4">
          {/* Date Selection Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Add to Diary</CardTitle>
              <CardDescription>
                Select which day to add this food entry to
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col gap-2">
                <Label>Select Date</Label>
                <Popover>
                  <PopoverTrigger
                    className={cn(
                      "w-full justify-start text-left inline-flex items-center gap-2 whitespace-nowrap rounded-md text-sm font-normal transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 aria-expanded:bg-accent aria-expanded:text-accent-foreground border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2",
                      !selectedDate && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? (
                      format(selectedDate, "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => date && setSelectedDate(date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <Button
                onClick={handleSave}
                isLoading={saveEntry.isPending}
                disabled={!selectedDate}
                className="w-full"
                size="lg"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add to {format(selectedDate, "MMMM d, yyyy")}
              </Button>
            </CardContent>
          </Card>

          {/* Preview Entry */}
          <div className="space-y-2">
            <h2 className="text-lg font-semibold">Preview</h2>
            <DiaryEntry
              entry={{
                calories: entry.totals.calories,
                carbs: entry.totals.carbs,
                content: entry.input,
                fat: entry.totals.fat,
                fiber: entry.totals.fiber,
                items: entry.items,
                name: entry.name,
                protein: entry.totals.protein,
                icon: entry.icon,
              }}
            />
          </div>
        </div>
      )}
    </main>
  );
}
