import { addDays, format, subDays } from "date-fns";
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { Button } from "~/components/ui/button";
import { Calendar } from "~/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { formatDate } from "~/hooks/useDates";

export default function DiaryNavigation() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const unparsedDate = searchParams.get("date") ?? new Date().toISOString();
  const date = unparsedDate ? new Date(unparsedDate) : new Date();

  function onDateChange(newDate: Date) {
    navigate(`/diary?date=${formatDate(newDate)}`);
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="icon"
        render={
          <Link
            to={`?date=${formatDate(subDays(date, 1))}`}
            prefetch="intent"
          />
        }
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <Popover>
        <PopoverTrigger
          render={
            <Button
              variant="outline"
              className="w-[240px] flex justify-start text-left font-normal"
            />
          }
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {format(date, "PPP")}
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={(newDate) => newDate && onDateChange(newDate)}
            initialFocus
          />
        </PopoverContent>
      </Popover>
      <Button
        variant="outline"
        size="icon"
        render={
          <Link
            to={`/diary?date=${formatDate(addDays(date, 1))}`}
            prefetch="intent"
          />
        }
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
