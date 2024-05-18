import { Link, useLoaderData } from "@remix-run/react";
import { addDays, isToday, subDays } from "date-fns";
import { buttonVariants } from "~/components/ui/button";
import { formatSimpleDate } from "~/hooks/useDates";
import { DiaryRouteData } from "~/routes/__authed.diary";
import { cn } from "~/utils";

export default function DiaryNavigation() {
  const { unparsedDate } = useLoaderData<DiaryRouteData>();
  const date = unparsedDate ? new Date(unparsedDate) : new Date();

  return (
    <div className="mb-4 flex justify-between items-center">
      <Link
        className={cn(buttonVariants(), "w-32")}
        to={`/diary?date=${subDays(date, 1).toISOString()}`}
      >
        Previous day
      </Link>

      <span>{isToday(date) ? "Today" : formatSimpleDate(date)}</span>

      {isToday(date) ? (
        <span className="w-32" />
      ) : (
        <Link
          className={cn(buttonVariants(), "w-32")}
          to={`/diary?date=${addDays(date, 1).toISOString()}`}
        >
          Next day
        </Link>
      )}
    </div>
  );
}
