import { format } from "date-fns";
import { Loader2, Dumbbell, Trash2, Sparkles, ChevronDown } from "lucide-react";
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
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "~/components/ui/collapsible";
import { trpc } from "~/utils/trpc";
import { marked } from "marked";
import DOMPurify from "dompurify";
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
            <Collapsible key={i} disabled={!ex.instructions}>
              <CollapsibleTrigger
                className="w-full text-left rounded-md border p-3 space-y-1.5 hover:bg-muted/50 transition-colors data-[state=open]:rounded-b-none disabled:cursor-default disabled:hover:bg-transparent"
                disabled={!ex.instructions}
              >
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-sm">{ex.name}</span>
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${categoryColors[ex.category]}`}
                  >
                    {ex.category}
                  </span>
                  {ex.instructions && (
                    <ChevronDown className="ml-auto h-3.5 w-3.5 text-muted-foreground transition-transform duration-200 [[data-state=open]_&]:rotate-180" />
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
              </CollapsibleTrigger>
              <CollapsibleContent
                className="prose prose-sm text-xs text-muted-foreground dark:prose-invert max-w-none p-3 border border-t-0 rounded-b-md"
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(marked(ex.instructions) as string),
                }}
              />
            </Collapsible>
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
