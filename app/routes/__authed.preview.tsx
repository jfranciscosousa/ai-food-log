import type { HeadersArgs, LoaderFunctionArgs } from "react-router";
import { data, Form, useLoaderData } from "react-router";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import useIsLoading from "~/hooks/useIsLoading";
import DiaryEntry from "~/modules/Diary/DiaryEntry";
import { processFoodWithAI } from "~/server/ai/processFoodWithAI.server";
import type { Route } from "./+types/__authed.preview";

export const meta = () => [
  {
    title: "Preview | AI Food Log",
  },
];

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const input = url.searchParams.get("input");

  if (input) {
    const entry = await processFoodWithAI(input);

    if (entry.invalid) {
      return data(
        {
          ...entry,
          success: false as const,
          error: "Invalid prompt",
          input,
        },
        { headers: { "Cache-Control": "max-age=3600, public" } },
      );
    }

    const totals = {
      calories: entry.items.reduce((acc, item) => acc + item.calories, 0),
      protein: entry.items.reduce((acc, item) => acc + item.protein, 0),
      carbs: entry.items.reduce((acc, item) => acc + item.carbs, 0),
      fat: entry.items.reduce((acc, item) => acc + item.fat, 0),
      fiber: entry.items.reduce((acc, item) => acc + item.fiber, 0),
    };

    return data(
      { ...entry, success: true as const, totals, input },
      { headers: { "Cache-Control": "max-age=3600, public" } },
    );
  }

  return null;
};

export function headers({ loaderHeaders }: HeadersArgs) {
  return loaderHeaders;
}

export type PreviewLoaderData = Route.ComponentProps["loaderData"];

export default function Preview() {
  const entry = useLoaderData<PreviewLoaderData>();
  const isLoading = useIsLoading();

  return (
    <main className="max-w-xl w-full mx-auto grow flex flex-col mb-4">
      <Form method="GET" className="flex gap-4 mb-6">
        <Input autoComplete="off" name="input" defaultValue={entry?.input} />

        <Button isLoading={isLoading} className="w-30">
          Search
        </Button>
      </Form>

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
