import { format } from "date-fns";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { ScrollArea, ScrollBar } from "~/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { formatNumber } from "~/lib/math";
import { DynamicIcon } from "~/components/DynamicIcon";
import DiaryEntryDeleteOne from "./DiaryEntryDeleteOne";
import { DiaryEntryUpdate } from "./DiaryEntryUpdate";

type Props = {
  entry: {
    id?: string;
    name: string;
    icon?: string | null;
    createdAt?: Date;
    content: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
    items: {
      name: string;
      servingSize: number;
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
      fiber: number;
    }[];
    fromImage?: boolean;
  };
  actionButtons?: React.ReactNode;
};

export default function DiaryEntry({ entry, actionButtons }: Props) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between space-y-0">
        <div className="flex-1 min-w-0">
          <CardTitle className="flex items-center gap-2 text-lg">
            {entry.icon && (
              <DynamicIcon name={entry.icon} className="h-5 w-5 shrink-0" />
            )}
            {entry.name}
          </CardTitle>
          {entry.createdAt && (
            <CardDescription>
              {format(entry.createdAt, "h:mm a")}
            </CardDescription>
          )}
          <div className="text-xs text-muted-foreground">
            Original prompt: {entry.content}
          </div>
        </div>

        {actionButtons ? (
          <div className="flex gap-2 shrink-0">{actionButtons}</div>
        ) : (
          entry.id && (
            <div className="flex gap-2 shrink-0">
              {/** TODO: edit image */}
              {!entry.fromImage && (
                <DiaryEntryUpdate
                  entryId={entry.id}
                  entryContent={entry.content}
                />
              )}
              <DiaryEntryDeleteOne entryId={entry.id} />
            </div>
          )
        )}
      </CardHeader>
      <div className="sm:px-6 px-4 pt-0">
        <div className="flex flex-col gap-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setExpanded((e) => !e)}
                className="gap-1"
              >
                {expanded ? (
                  <>
                    <ChevronUp className="h-4 w-4" />
                    Hide breakdown
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4" />
                    Show breakdown
                  </>
                )}
              </Button>
              <Badge variant="outline" className="ml-2">
                {entry.items.length} ingredients
              </Badge>
            </div>
          </div>

          <div className="flex flex-row gap-6">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">
                Calories
              </p>
              <p className="text-base font-bold">
                {formatNumber(entry.calories)}kcal
              </p>
            </div>

            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">
                Protein
              </p>
              <p className="text-base font-bold">
                {formatNumber(entry.protein)}g
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">Carbs</p>
              <p className="text-base font-bold">
                {formatNumber(entry.carbs)}g
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">Fat</p>
              <p className="text-base font-bold">{formatNumber(entry.fat)}g</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">Fiber</p>
              <p className="text-base font-bold">
                {formatNumber(entry.fiber)}g
              </p>
            </div>
          </div>
        </div>

        {expanded && (
          <ScrollArea>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ingredient</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Calories</TableHead>
                  <TableHead>Protein</TableHead>
                  <TableHead>Carbs</TableHead>
                  <TableHead>Fat</TableHead>
                  <TableHead>Fiber</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entry.items.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{item.servingSize}g</TableCell>
                    <TableCell>{formatNumber(item.calories)}kcal</TableCell>
                    <TableCell>{formatNumber(item.protein)}g</TableCell>
                    <TableCell>{formatNumber(item.carbs)}g</TableCell>
                    <TableCell>{formatNumber(item.fat)}g</TableCell>
                    <TableCell>{formatNumber(item.fiber)}g</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        )}
      </div>
    </Card>
  );
}
