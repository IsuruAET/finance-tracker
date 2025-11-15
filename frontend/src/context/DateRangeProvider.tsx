import { useState, useCallback, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { DateTime } from "luxon";
import toast from "react-hot-toast";
import { DateRangeContext, type DateRange } from "./DateRangeContext";

// Helper functions
const toISODate = (date: Date) => DateTime.fromJSDate(date).toISODate();
const getCurrentMonthRange = (): DateRange => {
  const now = DateTime.now();
  return {
    startDate: now.startOf("month").toJSDate(),
    endDate: now.endOf("month").toJSDate(),
    label: "Current Month",
  };
};

export const DateRangeProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const isCleaningParamsRef = useRef(false);

  const cleanInvalidDateParams = useCallback(() => {
    if (isCleaningParamsRef.current) return;
    isCleaningParamsRef.current = true;

    const params = new URLSearchParams(searchParams);
    params.delete("startDate");
    params.delete("endDate");
    setSearchParams(params, { replace: true });

    setTimeout(() => {
      isCleaningParamsRef.current = false;
    }, 100);
  }, [searchParams, setSearchParams]);

  const validateDateParams = useCallback(
    (startParam: string | null, endParam: string | null) => {
      const hasOneParam =
        (startParam && !endParam) || (!startParam && endParam);
      if (hasOneParam) {
        return {
          isValid: false,
          error: "Both startDate and endDate are required",
        };
      }

      if (!startParam || !endParam) {
        return { isValid: true, dateRange: getCurrentMonthRange() };
      }

      if (!startParam.trim() || !endParam.trim()) {
        return { isValid: false, error: "Date parameters cannot be empty" };
      }

      try {
        const startDateTime = DateTime.fromISO(startParam);
        const endDateTime = DateTime.fromISO(endParam);

        if (!startDateTime.isValid || !endDateTime.isValid) {
          return {
            isValid: false,
            error: "Invalid date format. Please use YYYY-MM-DD format",
          };
        }

        const startDate = startDateTime.toJSDate();
        const endDate = endDateTime.toJSDate();

        if (startDate > endDate) {
          return {
            isValid: false,
            error: "Start date must be before or equal to end date",
          };
        }

        // Validate ISO date matches input (catches invalid dates like 2025-13-45)
        if (
          startDateTime.toISODate() !== startParam ||
          endDateTime.toISODate() !== endParam
        ) {
          return {
            isValid: false,
            error:
              "Invalid date. Please provide a valid date in YYYY-MM-DD format",
          };
        }

        return { isValid: true, dateRange: { startDate, endDate } };
      } catch {
        return {
          isValid: false,
          error: "Invalid date parameters. Using default date range",
        };
      }
    },
    []
  );

  const getInitialDateRange = useCallback((): DateRange => {
    const startParam = searchParams.get("startDate");
    const endParam = searchParams.get("endDate");
    const validation = validateDateParams(startParam, endParam);

    if (!validation.isValid) {
      toast.error(validation.error || "Invalid date parameters");
      cleanInvalidDateParams();
      return getCurrentMonthRange();
    }

    return validation.dateRange || getCurrentMonthRange();
  }, [searchParams, validateDateParams, cleanInvalidDateParams]);

  const [dateRange, setDateRangeState] = useState<DateRange>(
    getInitialDateRange()
  );

  const setDateRange = useCallback(
    (range: DateRange) => {
      setDateRangeState(range);

      const params = new URLSearchParams(searchParams);
      params.set("startDate", toISODate(range.startDate) || "");
      params.set("endDate", toISODate(range.endDate) || "");
      setSearchParams(params, { replace: true });
    },
    [searchParams, setSearchParams]
  );

  useEffect(() => {
    if (isCleaningParamsRef.current) return;

    const newRange = getInitialDateRange();
    const currentStartISO = toISODate(dateRange.startDate);
    const currentEndISO = toISODate(dateRange.endDate);
    const newStartISO = toISODate(newRange.startDate);
    const newEndISO = toISODate(newRange.endDate);

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
