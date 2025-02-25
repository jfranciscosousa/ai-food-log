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
import { type DiaryRouteData } from "~/routes/__authed.diary";
import DiaryEntryDeleteOne from "./DiaryEntryDeleteOne";

type Props = {
  entry: DiaryRouteData["entriesForToday"][number];
};

export default function DiaryEntry({ entry }: Props) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-lg">{entry.name}</CardTitle>
          <CardDescription>{format(entry.createdAt, "h:mm a")}</CardDescription>
        </div>
        <DiaryEntryDeleteOne entryId={entry.id} />
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ingredient</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Protein</TableHead>
              <TableHead>Carbs</TableHead>
              <TableHead>Fat</TableHead>
              <TableHead>Fiber</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entry.items.map((ingredient, index) => (
              <TableRow key={index}>
                <TableCell>{ingredient.name}</TableCell>
                <TableCell>{ingredient.servingSize}g</TableCell>
                <TableCell>{ingredient.protein}g</TableCell>
                <TableCell>{ingredient.carbs}g</TableCell>
                <TableCell>{ingredient.fat}g</TableCell>
                <TableCell>{ingredient.fiber}g</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
