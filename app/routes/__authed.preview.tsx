import type { LoaderFunctionArgs, MetaFunction } from "react-router";
import { Form, useLoaderData } from "react-router";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import useIsLoading from "~/hooks/useIsLoading";
import { processFoodWithAI } from "~/server/ai/processFoodWithAI.server";
import type { Info } from "./+types/__authed.preview";

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

    return { ...entry, totals, input };
  }

  return null;
};

export type PreviewLoaderData = Info["loaderData"];

export default function Preview() {
  const entry = useLoaderData<PreviewLoaderData>();
  const isLoading = useIsLoading();

  return (
    <main className="max-w-xl w-full mx-auto flex-grow flex flex-col mb-4">
      <Form method="GET" className="flex gap-4">
        <Input autoComplete="off" name="input" defaultValue={entry?.input} />

        <Button isLoading={isLoading} className="w-[120px]">
          Search
        </Button>
      </Form>

      {entry && (
        <div className="mt-4">
          <p className="text-lg font-bold">{entry.name}</p>

          <ul className="pb-4">
            {entry.items.map((item, index) => (
              <li key={index} className="list-disc ml-4">
                {item.name}, {item.servingSize}g, {item.calories} calories,{" "}
                {item.protein}g protein, {item.carbs}g carbs, {item.fat}g fat,{" "}
                {item.fiber}g fiber
              </li>
            ))}
          </ul>

          <p>
            Totals: {entry.totals.calories} calories, {entry.totals.protein}g
            protein, {entry.totals.carbs}g carbs, {entry.totals.fat}g fat,{" "}
            {entry.totals.fiber}g fiber
          </p>
        </div>
      )}
    </main>
  );
}
