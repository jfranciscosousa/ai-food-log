import {
  format,
  formatDistance,
  formatRelative,
  FormatRelativeOptions,
} from "date-fns";
import { useMemo } from "react";
import { useRootLoaderData } from "./useRootLoaderData";

function formatDateLocale(timestamp: string | Date, locale: string) {
  return new Date(timestamp).toLocaleString(locale);
}

function formatDistanceTime(timestamp: string | Date, rootTime: string) {
  return formatDistance(timestamp, new Date(rootTime));
}

function formatRelativeTime(
  timestamp: string | Date,
  rootTime: string,
  options?: FormatRelativeOptions,
) {
  return formatRelative(timestamp, new Date(rootTime), options);
}

export function formatSimpleDate(timestamp: string | Date) {
  return format(new Date(timestamp), "yyyy-MM-dd");
}

export default function useDates() {
  const { locale, rootTime } = useRootLoaderData();

  return useMemo(
    () => ({
      formatDateLocale: (timestamp: string | Date) =>
        formatDateLocale(timestamp, locale),
      formatDistanceTime: (timestamp: string | Date) =>
        formatDistanceTime(timestamp, rootTime),
      formatRelativeTime: (
        timestamp: string | Date,
        options?: FormatRelativeOptions,
      ) => formatRelativeTime(timestamp, rootTime, options),
    }),
    [locale, rootTime],
  );
}
