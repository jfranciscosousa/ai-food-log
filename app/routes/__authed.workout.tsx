import { useState } from "react";
import { useSearchParams } from "react-router";
import WorkoutNavigation from "~/domains/Workout/WorkoutNavigation";
import WorkoutPlanForm from "~/domains/Workout/WorkoutPlanForm";
import WorkoutPlanView from "~/domains/Workout/WorkoutPlanView";

export const meta = () => [
  {
    title: "Workout | Vigor",
  },
];

export default function WorkoutPage() {
  const [searchParams] = useSearchParams();
  const [today] = useState(new Date().toISOString());
  const date = searchParams.get("date") ?? today;

  return (
    <>
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Workout</h1>
        <p className="text-muted-foreground">
          Plan and track your daily workouts
        </p>
      </div>

      <div className="flex flex-col items-center">
        <WorkoutNavigation />
      </div>

      <WorkoutPlanForm date={date} />

      <WorkoutPlanView date={date} />
    </>
  );
}
