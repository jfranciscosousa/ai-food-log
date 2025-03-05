import type {
  HeadersArgs,
  LoaderFunctionArgs,
  MetaFunction,
} from "react-router";
import { data, Form, useLoaderData } from "react-router";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import useIsLoading from "~/hooks/useIsLoading";
import { processFoodWithAI } from "~/server/ai/processFoodWithAI.server";
import type { Info } from "./+types/__authed.preview";
import DiaryEntry from "~/modules/Diary/DiaryEntry";

export const meta: MetaFunction = () => [
  {
    title: "Preview",
  },
];

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const input = url.searchParams.get("input");

  if (input) {
    const entry = await processFoodWithAI(input);

    const totals = {
      calories: entry.items.reduce((acc, item) => acc + item.calories, 0),
      protein: entry.items.reduce((acc, item) => acc + item.protein, 0),
      carbs: entry.items.reduce((acc, item) => acc + item.carbs, 0),
      fat: entry.items.reduce((acc, item) => acc + item.fat, 0),
      fiber: entry.items.reduce((acc, item) => acc + item.fiber, 0),
    };

    return data(
      { ...entry, totals, input },
      { headers: { "Cache-Control": "max-age=3600, public" } },
    );
  }

  return null;
};

export function headers({ loaderHeaders }: HeadersArgs) {
  return loaderHeaders;
}

export type PreviewLoaderData = Info["loaderData"];

export default function Preview() {
  const entry = useLoaderData<PreviewLoaderData>();
  const isLoading = useIsLoading();

  return (
    <main className="max-w-xl w-full mx-auto grow flex flex-col mb-4">
      <Form method="GET" className="flex gap-4 mb-6">
        <Input autoComplete="off" name="input" defaultValue={entry?.input} />

        <Button isLoading={isLoading} className="w-[120px]">
          Search
        </Button>
      </Form>

      {entry && (
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
