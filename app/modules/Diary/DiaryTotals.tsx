import { useMemo } from "react";
import { useLoaderData } from "react-router";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Progress } from "~/components/ui/progress";
import useUser from "~/hooks/useUser";
import { type DiaryRouteData } from "~/routes/__authed.diary";

export default function DiaryTotals() {
  const user = useUser();
  const { entriesTotals } = useLoaderData<DiaryRouteData>();
  const calorieProgress = (entriesTotals.calories / user.targetCalories) * 100;
  const calorieStatus = useMemo(() => {
    if (entriesTotals.calories > user.targetCalories) {
      return {
        color: "text-red-500 dark:text-red-400",
        message: "Over target",
      };
    }
    if (entriesTotals.calories === user.targetCalories) {
      return {
        color: "text-green-500 dark:text-green-400",
        message: "On target",
      };
    }
    return {
      color: "text-yellow-500 dark:text-yellow-400",
      message: "Under target",
    };
  }, [entriesTotals.calories, user.targetCalories]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Daily Summary</CardTitle>
        <CardDescription>Total macronutrients for the day</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-sm font-medium">Calories</span>
            <div className="flex items-center gap-2 text-sm">
              <div className="flex items-center gap-1.5">
                <span className="font-medium">{entriesTotals.calories}</span>
                <span className="text-muted-foreground">/</span>
                <span className="text-muted-foreground">
                  {Math.round(user.targetCalories)}
                </span>
              </div>
              <span className={`${calorieStatus.color}`}>
                ({calorieStatus.message})
              </span>
            </div>
          </div>
          <Progress value={calorieProgress} className="h-2" />
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Protein</p>
            <p className="text-2xl font-bold">
              {entriesTotals.protein.toFixed(1)}g
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Carbs</p>
            <p className="text-2xl font-bold">
              {entriesTotals.carbs.toFixed(1)}g
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Fat</p>
            <p className="text-2xl font-bold">
              {entriesTotals.fat.toFixed(1)}g
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Fiber</p>
            <p className="text-2xl font-bold">
              {entriesTotals.fiber.toFixed(1)}g
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
