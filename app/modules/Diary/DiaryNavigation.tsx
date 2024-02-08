import { Link, useLoaderData } from "@remix-run/react";
import { addDays, isToday, subDays } from "date-fns";
import { buttonVariants } from "~/components/ui/button";
import useDates from "~/hooks/useDates";
import { DiaryRouteData } from "~/routes/__authed.diary";
import { cn } from "~/utils";

export default function DiaryNavigation() {
  const { unparsedDate } = useLoaderData<DiaryRouteData>();
  const date = new Date(unparsedDate);
  const { formatRelativeTime } = useDates();

  return (
    <div className="mb-4 flex justify-between items-center">
      <Link
        className={cn(buttonVariants(), "w-32")}
        to={`/diary?date=${subDays(date, 1).toISOString()}`}
      >
        Previous day
      </Link>

      <span>{isToday(date) ? "Today" : `${formatRelativeTime(date)} ago`}</span>

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
