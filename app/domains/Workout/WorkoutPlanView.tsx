import { format } from "date-fns";
import { Loader2, Dumbbell, Trash2, Sparkles, Info } from "lucide-react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { trpc } from "~/utils/trpc";
import type { Exercise } from "~/server/ai/generateWorkoutPlan.server";

const categoryColors: Record<Exercise["category"], string> = {
  warmup:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  strength: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  cardio: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  flexibility:
    "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  cooldown:
    "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
};

interface WorkoutPlanViewProps {
  date: string;
}

export default function WorkoutPlanView({ date }: WorkoutPlanViewProps) {
  const utils = trpc.useUtils();
  const { data: plan, isLoading } = trpc.workout.getPlanForDay.useQuery({
    date,
  });

  const deletePlan = trpc.workout.deletePlan.useMutation({
    onSuccess: () => utils.workout.getPlanForDay.invalidate({ date }),
    onError: () => toast.error("Failed to delete plan"),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed p-12 text-center">
        <Dumbbell className="h-12 w-12 text-muted-foreground" />
        <div className="space-y-1">
          <h3 className="font-semibold">No workout planned</h3>
          <p className="text-sm text-muted-foreground">
            Use the form above to write a plan or let AI suggest one
          </p>
        </div>
      </div>
    );
  }

  const exercises = plan.exercises as Exercise[];

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between space-y-0">
        <div className="space-y-1">
          <CardTitle className="flex items-center gap-2">
            {plan.aiGenerated && (
              <Sparkles className="h-4 w-4 text-muted-foreground" />
            )}
            {plan.name}
          </CardTitle>
          <CardDescription>
            {format(new Date(plan.createdAt), "h:mm a")}
          </CardDescription>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-destructive"
          isLoading={deletePlan.isPending}
          onClick={() => deletePlan.mutate({ id: plan.id })}
        >
          <Trash2 className="h-4 w-4" />
          <span className="sr-only">Delete plan</span>
        </Button>
      </CardHeader>

      <CardContent className="space-y-3">
        {exercises.length > 0 ? (
          exercises.map((ex, i) => (
            <div key={i} className="space-y-1.5 rounded-md border p-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-medium text-sm">{ex.name}</span>
                <span
                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${categoryColors[ex.category]}`}
                >
                  {ex.category}
                </span>
                {ex.instructions && (
                  <Popover>
                    <PopoverTrigger className="text-muted-foreground hover:text-foreground transition-colors">
                      <Info className="h-3.5 w-3.5" />
                      <span className="sr-only">Instructions</span>
                    </PopoverTrigger>
                    <PopoverContent
                      side="top"
                      className="w-80 text-xs leading-relaxed"
                    >
                      {ex.instructions}
                    </PopoverContent>
                  </Popover>
                )}
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-muted-foreground">
                {ex.sets && ex.reps && (
                  <span>
                    {ex.sets} × {ex.reps}
                  </span>
                )}
                {ex.duration && <span>{ex.duration}</span>}
                {ex.restTime && <span>Rest: {ex.restTime}</span>}
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
            {plan.content}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
