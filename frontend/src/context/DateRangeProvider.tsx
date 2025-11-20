import { useState, useCallback, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { DateTime } from "luxon";
import { DateRangeContext, type DateRange } from "./DateRangeContext";

const STORAGE_KEY = "finance-tracker-date-range";

const serializeDate = (date: Date) =>
  DateTime.fromJSDate(date).toISODate() || "";

const persistRange = (range: DateRange) => {
  if (typeof window === "undefined") return;

  try {
    const payload = JSON.stringify({
      startDate: serializeDate(range.startDate),
      endDate: serializeDate(range.endDate),
      label: range.label,
    });
    window.sessionStorage.setItem(STORAGE_KEY, payload);
  } catch {
    // Ignore storage errors (e.g., quota exceeded, disabled cookies)
  }
};

const getStoredRange = (): DateRange | null => {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw);
    if (!parsed.startDate || !parsed.endDate) {
      return null;
    }

    const startDate = DateTime.fromISO(parsed.startDate);
    const endDate = DateTime.fromISO(parsed.endDate);

    if (!startDate.isValid || !endDate.isValid) {
      return null;
    }

    return {
      startDate: startDate.toJSDate(),
      endDate: endDate.toJSDate(),
      label: parsed.label,
    };
  } catch {
    return null;
  }
};

const areRangesEqual = (a: DateRange, b: DateRange) => {
  const aStart = DateTime.fromJSDate(a.startDate).toISODate();
  const aEnd = DateTime.fromJSDate(a.endDate).toISODate();
  const bStart = DateTime.fromJSDate(b.startDate).toISODate();
  const bEnd = DateTime.fromJSDate(b.endDate).toISODate();

  return aStart === bStart && aEnd === bEnd;
};

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
        const range = {
          startDate,
          endDate,
        };
        persistRange(range);
        return range;
      } catch {
        // Invalid date params, fall back to stored/default range
      }
    }

    const storedRange = getStoredRange();
    if (storedRange) {
      return storedRange;
    }

    return getCurrentMonthRange();
  }, [searchParams, getCurrentMonthRange]);

  const [dateRange, setDateRangeState] = useState<DateRange>(
    getInitialDateRange()
  );

  // Update URL params when date range changes
  const applyRangeToUrl = useCallback(
    (range: DateRange) => {
      const params = new URLSearchParams(searchParams);
      params.set("startDate", serializeDate(range.startDate));
      params.set("endDate", serializeDate(range.endDate));
      setSearchParams(params, { replace: true });
    },
    [searchParams, setSearchParams]
  );

  const setDateRange = useCallback(
    (range: DateRange) => {
      setDateRangeState(range);
      persistRange(range);
      applyRangeToUrl(range);
    },
    [applyRangeToUrl]
  );

  // Sync state when URL params change (e.g., browser back/forward)
  useEffect(() => {
    const startParam = searchParams.get("startDate");
    const endParam = searchParams.get("endDate");

    if (startParam && endParam) {
      const startDate = DateTime.fromISO(startParam);
      const endDate = DateTime.fromISO(endParam);

      if (startDate.isValid && endDate.isValid) {
        const newRange: DateRange = {
          startDate: startDate.toJSDate(),
          endDate: endDate.toJSDate(),
        };

        if (!areRangesEqual(dateRange, newRange)) {
          setDateRangeState(newRange);
        }

        persistRange(newRange);
        return;
      }
    }

    const storedOrDefault = getStoredRange() ?? getCurrentMonthRange();

    if (!areRangesEqual(dateRange, storedOrDefault)) {
      setDateRange(storedOrDefault);
    } else if (!startParam || !endParam) {
      applyRangeToUrl(storedOrDefault);
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
