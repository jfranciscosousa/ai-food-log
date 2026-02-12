import { useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Progress } from "~/components/ui/progress";
import { DiaryClearDay } from "./DiaryClearDay";
import { formatNumber } from "~/lib/math";
import { trpc } from "~/utils/trpc";

interface DiaryDailySummaryProps {
  totals?: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
  };
}

export default function DiaryDailySummary({ totals }: DiaryDailySummaryProps) {
  const { data: user } = trpc.auth.me.useQuery();

  const entriesTotals = totals ?? {
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    fiber: 0,
  };

  const calorieProgress = user
    ? (entriesTotals.calories / user.targetCalories) * 100
    : 0;
  const calorieStatus = useMemo(() => {
    if (!user) {
      return {
        color: "text-muted-foreground",
        message: "Loading...",
      };
    }
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
  }, [entriesTotals.calories, user]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between">
        <div className="flex flex-col gap-2">
          <CardTitle>Daily Summary</CardTitle>
          <CardDescription>Total macronutrients for the day</CardDescription>
        </div>

        <DiaryClearDay />
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-sm font-medium">Calories</span>
            <div className="flex items-center gap-2 text-sm">
              <div className="flex items-center gap-1.5">
                <span className="font-medium">
                  {formatNumber(entriesTotals.calories, 0)}
                </span>
                <span className="text-muted-foreground">/</span>
                <span className="text-muted-foreground">
                  {user ? formatNumber(user.targetCalories, 0) : "..."}
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
              {formatNumber(entriesTotals.protein)}g
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Carbs</p>
            <p className="text-2xl font-bold">
              {formatNumber(entriesTotals.carbs)}g
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Fat</p>
            <p className="text-2xl font-bold">
              {formatNumber(entriesTotals.fat)}g
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Fiber</p>
            <p className="text-2xl font-bold">
              {formatNumber(entriesTotals.fiber)}g
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
