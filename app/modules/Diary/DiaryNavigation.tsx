import { Link, useLoaderData } from "react-router";
import { addDays, isToday, subDays } from "date-fns";
import { buttonVariants } from "~/components/ui/button";
import { formatDate, formatDateWithoutTime } from "~/hooks/useDates";
import { type DiaryRouteData } from "~/routes/__authed.diary";
import { cn } from "~/utils";

export default function DiaryNavigation() {
  const { unparsedDate } = useLoaderData<DiaryRouteData>();
  const date = unparsedDate ? new Date(unparsedDate) : new Date();

  return (
    <div className="mb-4 flex justify-between items-center">
      <Link
        className={cn(buttonVariants({ size: "sm" }), "w-24 p-2 text-xs")}
        to={`/diary?date=${formatDate(subDays(date, 1))}`}
      >
        Previous day
      </Link>

      <span>{isToday(date) ? "Today" : formatDateWithoutTime(date)}</span>

      {isToday(date) ? (
        <span className="w-32" />
      ) : (
        <Link
          className={cn(
            buttonVariants({ size: "sm" }),
            "w-32 w-24 p-2 text-xs",
          )}
          to={`/diary?date=${formatDate(addDays(date, 1))}`}
        >
          Next day
        </Link>
      )}
    </div>
  );
}
