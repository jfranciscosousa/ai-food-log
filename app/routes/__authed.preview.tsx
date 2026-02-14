import { useSearchParams } from "react-router";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import DiaryEntry from "~/domains/Diary/DiaryEntry";
import { trpc } from "~/utils/trpc";

export const meta = () => [
  {
    title: "Preview | AI Food Log",
  },
];

export default function Preview() {
  const [searchParams, setSearchParams] = useSearchParams();
  const input = searchParams.get("input") ?? "";

  const { data: entry, isLoading } = trpc.food.previewEntry.useQuery(
    { input },
    { enabled: !!input },
  );

  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const inputValue = formData.get("input") as string;
    setSearchParams({ input: inputValue });
  };

  return (
    <main className="max-w-xl w-full mx-auto grow flex flex-col mb-4">
      <form onSubmit={handleSubmit} className="flex gap-4 mb-6">
        <Input autoComplete="off" name="input" defaultValue={input} />

        <Button isLoading={isLoading} className="w-30">
          Search
        </Button>
      </form>

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

      {entry && entry.success && (
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
          }}
        />
      )}
    </main>
  );
}
