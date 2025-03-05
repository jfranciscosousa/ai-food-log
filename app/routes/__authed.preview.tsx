import type { LoaderFunctionArgs, MetaFunction } from "react-router";
import { Form, useLoaderData } from "react-router";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import useIsLoading from "~/hooks/useIsLoading";
import { processFoodWithAI } from "~/server/ai/processFoodWithAI.server";
import type { Info } from "./+types/__authed.preview";
import DiaryEntry from "~/modules/Diary/DIaryEntry";

export const meta: MetaFunction = () => [
  {
    title: "Preview",
  },
];

const dumbCache = new Map<
  string,
  Awaited<ReturnType<typeof processFoodWithAI>>
>();

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const input = url.searchParams.get("input");

  if (input) {
    const val = dumbCache.get(input);
    const entry = val ? val : await processFoodWithAI(input);

    dumbCache.set(input, entry);

    const totals = {
      calories: entry.items.reduce((acc, item) => acc + item.calories, 0),
      protein: entry.items.reduce((acc, item) => acc + item.protein, 0),
      carbs: entry.items.reduce((acc, item) => acc + item.carbs, 0),
      fat: entry.items.reduce((acc, item) => acc + item.fat, 0),
      fiber: entry.items.reduce((acc, item) => acc + item.fiber, 0),
    };

    return { ...entry, totals, input };
  }

  return null;
};

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
            calories: String(Math.round(entry.totals.calories)),
            carbs: String(Math.round(entry.totals.carbs)),
            content: entry.input,
            fat: String(Math.round(entry.totals.fat)),
            fiber: String(Math.round(entry.totals.fiber)),
            items: entry.items,
            name: entry.name,
            protein: String(Math.round(entry.totals.protein)),
          }}
        />
      )}
    </main>
  );
}
