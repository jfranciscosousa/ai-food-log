import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import DiaryEntryDeleteOne from "./DiaryEntryDeleteOne";
import { ScrollArea, ScrollBar } from "~/components/ui/scroll-area";
import { DiaryEntryUpdate } from "./DiaryEntryUpdate";

type Props = {
  entry: {
    id?: string;
    name: string;
    createdAt?: string;
    content: string;
    calories: string;
    protein: string;
    carbs: string;
    fat: string;
    fiber: string;
    items: {
      name: string;
      servingSize: number;
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
      fiber: number;
    }[];
  };
};

export default function DiaryEntry({ entry }: Props) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between space-y-0">
        <div>
          <CardTitle className="text-lg">{entry.name}</CardTitle>
          {entry.createdAt && (
            <CardDescription>
              {format(entry.createdAt, "h:mm a")}
            </CardDescription>
          )}
          <div className="text-xs text-muted-foreground">
            Original prompt: {entry.content}
          </div>
        </div>

        {entry.id && (
          <div className="flex gap-2">
            <DiaryEntryUpdate entryId={entry.id} entryContent={entry.content} />
            <DiaryEntryDeleteOne entryId={entry.id} />
          </div>
        )}
      </CardHeader>
      <CardContent>
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
                  <TableCell>{item.calories}kcal</TableCell>
                  <TableCell>{item.protein}g</TableCell>
                  <TableCell>{item.carbs}g</TableCell>
                  <TableCell>{item.fat}g</TableCell>
                  <TableCell>{item.fiber}g</TableCell>
                </TableRow>
              ))}

              {entry.items.length > 1 && (
                <TableRow className="border-t-2">
                  <TableCell colSpan={2} className="font-medium">
                    Meal Totals
                  </TableCell>
                  <TableCell className="font-medium">
                    {entry.calories}kcal
                  </TableCell>
                  <TableCell className="font-medium">
                    {entry.protein}g
                  </TableCell>
                  <TableCell className="font-medium">{entry.carbs}g</TableCell>
                  <TableCell className="font-medium">{entry.fat}g</TableCell>
                  <TableCell className="font-medium">{entry.fiber}g</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
