import { useMemo } from "react";
import { Trash2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Progress } from "~/components/ui/progress";
import { Button } from "~/components/ui/button";
import useUser from "~/hooks/useUser";
import { formatNumber } from "~/lib/math";
import { DiaryClearDay } from "./DiaryClearDay";
import { trpc } from "~/utils/trpc";

interface DiaryDailySummaryProps {
  date: string;
}

type MacroItemProps = {
  label: string;
  current: number;
  target?: number | null;
  showProgress?: boolean;
};

function MacroItem({ label, current, target, showProgress }: MacroItemProps) {
  const progress = target ? (current / target) * 100 : 0;
  const status = useMemo(() => {
    if (!target) return null;
    if (current > target) {
      return {
        color: "text-red-500 dark:text-red-400",
        message: "Over",
      };
    }
    if (current === target) {
      return {
        color: "text-green-500 dark:text-green-400",
        message: "On target",
      };
    }
    return {
      color: "text-yellow-500 dark:text-yellow-400",
      message: "Under",
    };
  }, [current, target]);

  if (showProgress && target) {
    return (
      <div className="space-y-2">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-sm font-medium">{label}</span>
          <div className="flex items-center gap-2 text-sm">
            <div className="flex items-center gap-1.5">
              <span className="font-medium">{formatNumber(current, 0)}</span>
              <span className="text-muted-foreground">/</span>
              <span className="text-muted-foreground">
                {formatNumber(target, 0)}
              </span>
            </div>
            {status && (
              <span className={`${status.color}`}>({status.message})</span>
            )}
          </div>
        </div>
        <Progress value={progress} className="h-2" />
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <p className="text-2xl font-bold">{formatNumber(current)}g</p>
      {target ? (
        <p className="text-xs text-muted-foreground">
          Goal: {formatNumber(target)}g
        </p>
      ) : (
        <span className="block h-4" />
      )}
    </div>
  );
}

export default function DiaryDailySummary({ date }: DiaryDailySummaryProps) {
  const user = useUser();
  const { data: totals, isLoading } = trpc.food.getAggregateForDay.useQuery({
    date,
  });

  const entriesTotals = totals ?? {
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    fiber: 0,
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-start justify-between">
          <div className="flex flex-col gap-2">
            <CardTitle>Daily Summary</CardTitle>
            <CardDescription>Total macronutrients for the day</CardDescription>
          </div>

          <Button variant="destructive" size="sm" className="gap-2" disabled>
            <Trash2 className="h-4 w-4" />
            Clear Day
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="h-5 w-20 animate-pulse rounded bg-muted" />
              <div className="h-5 w-48 animate-pulse rounded bg-muted" />
            </div>
            <Progress value={0} className="h-2 opacity-20" />
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-1">
                <div className="h-5 w-16 animate-pulse rounded bg-muted" />
                <div className="h-8 w-20 animate-pulse rounded bg-muted" />
                <span className="block h-4" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

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
        <MacroItem
          label="Calories"
          current={entriesTotals.calories}
          target={user?.targetCalories}
          showProgress
        />

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <MacroItem
            label="Protein"
            current={entriesTotals.protein}
            target={user?.targetProtein}
          />
          <MacroItem
            label="Carbs"
            current={entriesTotals.carbs}
            target={user?.targetCarbs}
          />
          <MacroItem
            label="Fat"
            current={entriesTotals.fat}
            target={user?.targetFat}
          />
          <MacroItem
            label="Fiber"
            current={entriesTotals.fiber}
            target={user?.targetFiber}
          />
        </div>
      </CardContent>
    </Card>
  );
}
