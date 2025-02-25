import { useLoaderData } from "react-router";
import { Card, CardContent, CardHeader } from "~/components/ui/card";
import useUser from "~/hooks/useUser";
import { type DiaryRouteData } from "~/routes/__authed.diary";

export default function DiaryTotals() {
  const user = useUser();
  const { entriesTotals } = useLoaderData<DiaryRouteData>();

  return (
    <Card>
      <CardHeader className="flex flex-row justify-between">
        <span>Target: {Math.round(Number(user.targetCalories))} kcal</span>
      </CardHeader>

      <CardContent>
        Totals: {entriesTotals.calories} calories, {entriesTotals.protein}g
        protein, {entriesTotals.carbs}g carbs, {entriesTotals.fat}g fat,{" "}
        {entriesTotals.fiber}g fiber
      </CardContent>
    </Card>
  );
}
