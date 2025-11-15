import { useState, useCallback, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { DateTime } from "luxon";
import { DateRangeContext, type DateRange } from "./DateRangeContext";

export const DateRangeProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const getCurrentMonthRange = useCallback(() => {
    const now = DateTime.now();
    return {
      startDate: now.startOf("month").toJSDate(),
      endDate: now.endOf("month").toJSDate(),
      label: "Current Month",
    };
  }, []);

  // Initialize from URL params or default to current month
  const getInitialDateRange = useCallback((): DateRange => {
    const startParam = searchParams.get("startDate");
    const endParam = searchParams.get("endDate");

    if (startParam && endParam) {
      try {
        const startDate = DateTime.fromISO(startParam).toJSDate();
        const endDate = DateTime.fromISO(endParam).toJSDate();
        return {
          startDate,
          endDate,
        };
      } catch {
        // Invalid date params, fall back to default
        return getCurrentMonthRange();
      }
    }

    return getCurrentMonthRange();
  }, [searchParams, getCurrentMonthRange]);

  const [dateRange, setDateRangeState] = useState<DateRange>(
    getInitialDateRange()
  );

  // Update URL params when date range changes
  const setDateRange = useCallback(
    (range: DateRange) => {
      setDateRangeState(range);

      const params = new URLSearchParams(searchParams);
      params.set(
        "startDate",
        DateTime.fromJSDate(range.startDate).toISODate() || ""
      );
      params.set(
        "endDate",
        DateTime.fromJSDate(range.endDate).toISODate() || ""
      );

      setSearchParams(params, { replace: true });
    },
    [searchParams, setSearchParams]
  );

  // Sync state when URL params change (e.g., browser back/forward)
  useEffect(() => {
    const newRange = getInitialDateRange();
    const currentStartISO = DateTime.fromJSDate(
      dateRange.startDate
    ).toISODate();
    const currentEndISO = DateTime.fromJSDate(dateRange.endDate).toISODate();
    const newStartISO = DateTime.fromJSDate(newRange.startDate).toISODate();
    const newEndISO = DateTime.fromJSDate(newRange.endDate).toISODate();

    if (currentStartISO !== newStartISO || currentEndISO !== newEndISO) {
      setDateRangeState(newRange);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.toString()]);

  return (
    <DateRangeContext.Provider
      value={{
        dateRange,
        setDateRange,
        getCurrentMonthRange,
      }}
    >
      {children}
    </DateRangeContext.Provider>
  );
};
