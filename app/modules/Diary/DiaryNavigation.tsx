import { addDays, format, subDays } from "date-fns";
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { Link, useLoaderData, useNavigate } from "react-router";
import { Button } from "~/components/ui/button";
import { Calendar } from "~/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { formatDate } from "~/hooks/useDates";
import { type DiaryRouteData } from "~/routes/__authed.diary";

export default function DiaryNavigation() {
  const navigate = useNavigate();
  const { unparsedDate } = useLoaderData<DiaryRouteData>();
  const date = unparsedDate ? new Date(unparsedDate) : new Date();

  function onDateChange(newDate: Date) {
    navigate(`/diary?date=${formatDate(newDate)}`);
  }

  return (
    <div className="flex items-center gap-2">
      <Link to={`?date=${formatDate(subDays(date, 1))}`} prefetch="intent">
        <Button variant="outline" size="icon" asChild>
          <ChevronLeft className="h-4 w-4" />
        </Button>
      </Link>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-[240px] flex justify-start text-left font-normal"
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {format(date, "PPP")}
          </Button>
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
      <Link
        to={`/diary?date=${formatDate(addDays(date, 1))}`}
        prefetch="intent"
      >
        <Button variant="outline" size="icon" asChild>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </Link>
    </div>
  );
}
