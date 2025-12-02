import { useState, useCallback, useEffect } from "react";
import { useSearchParams, useLocation } from "react-router-dom";
import { DateTime } from "luxon";
import { MonthYearFilterContext } from "./MonthYearFilterContext";
import { getCurrentMonthYear, getCurrentDate } from "../utils/helper";

type MonthYear = {
  month: number;
  year: number;
};

const STORAGE_KEY = "finance-tracker-month-year-filter";

const persistMonthYear = (month: MonthYear | null) => {
  if (typeof window === "undefined") return;

  try {
    if (month) {
      window.sessionStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ month: month.month, year: month.year })
      );
    } else {
      window.sessionStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // Ignore storage errors (e.g., quota exceeded, disabled cookies)
  }
};

const getStoredMonthYear = (): MonthYear | null => {
  if (typeof window === "undefined") return null;

  try {
    const stored = window.sessionStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (
        parsed &&
        typeof parsed.month === "number" &&
        typeof parsed.year === "number" &&
        parsed.month >= 1 &&
        parsed.month <= 12
      ) {
        return { month: parsed.month, year: parsed.year };
      }
    }
    return null;
  } catch {
    return null;
  }
};

const getCurrentMonth = (): MonthYear => {
  const now = DateTime.now();
  return { month: now.month, year: now.year };
};

// Routes where search params should be applied
const DASHBOARD_ROUTES = ["/dashboard"];

const shouldApplySearchParams = (pathname: string): boolean => {
  return DASHBOARD_ROUTES.some((route) => pathname === route || pathname.startsWith(route + "/"));
};

export const MonthYearFilterProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();

  // Initialize from URL params or storage, default to current month
  const getInitialMonth = useCallback((): MonthYear => {
    const monthParam = searchParams.get("month");
    const yearParam = searchParams.get("year");

    if (monthParam && yearParam) {
      const month = Number(monthParam);
      const year = Number(yearParam);

      if (
        Number.isFinite(month) &&
        Number.isFinite(year) &&
        month >= 1 &&
        month <= 12
      ) {
        const monthYear = { month, year };
        persistMonthYear(monthYear);
        return monthYear;
      }
    }

    const stored = getStoredMonthYear();
    if (stored !== null) {
      return stored;
    }

    return getCurrentMonth();
  }, [searchParams]);

  const [selectedMonth, setSelectedMonthState] = useState<MonthYear | null>(
    getInitialMonth()
  );

  // Update URL params when month changes (only on dashboard routes)
  const applyMonthToUrl = useCallback(
    (month: MonthYear | null) => {
      if (!shouldApplySearchParams(location.pathname)) {
        return; // Don't update URL params on non-dashboard routes
      }
      const params = new URLSearchParams(searchParams);
      if (month) {
        params.set("month", month.month.toString());
        params.set("year", month.year.toString());
      } else {
        params.delete("month");
        params.delete("year");
      }
      setSearchParams(params, { replace: true });
    },
    [searchParams, setSearchParams, location.pathname]
  );

  const setSelectedMonth = useCallback(
    (month: MonthYear | null) => {
      setSelectedMonthState(month);
      persistMonthYear(month);
      applyMonthToUrl(month);
    },
    [applyMonthToUrl]
  );

  // Sync state when URL params change (e.g., browser back/forward)
  useEffect(() => {
    const monthParam = searchParams.get("month");
    const yearParam = searchParams.get("year");

    if (monthParam && yearParam) {
      const month = Number(monthParam);
      const year = Number(yearParam);

      if (
        Number.isFinite(month) &&
        Number.isFinite(year) &&
        month >= 1 &&
        month <= 12
      ) {
        const newMonth = { month, year };
        if (
          !selectedMonth ||
          selectedMonth.month !== newMonth.month ||
          selectedMonth.year !== newMonth.year
        ) {
          setSelectedMonthState(newMonth);
          persistMonthYear(newMonth);
        }
        return;
      }
    }

    // No valid params, use current month
    const currentMonth = getCurrentMonth();
    if (
      !selectedMonth ||
      selectedMonth.month !== currentMonth.month ||
      selectedMonth.year !== currentMonth.year
    ) {
      setSelectedMonthState(currentMonth);
      persistMonthYear(currentMonth);
      if (shouldApplySearchParams(location.pathname)) {
        applyMonthToUrl(currentMonth);
      }
    } else if (
      (!monthParam || !yearParam) &&
      shouldApplySearchParams(location.pathname)
    ) {
      // URL doesn't have params, but state does - sync to URL
      applyMonthToUrl(currentMonth);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.toString(), location.pathname]);

  const getSelectedMonthLabel = useCallback((): string => {
    if (!selectedMonth) return getCurrentMonthYear();
    const date = new Date(selectedMonth.year, selectedMonth.month - 1, 1);
    return date.toLocaleString("default", { month: "short", year: "numeric" });
  }, [selectedMonth]);

  const getSelectedDateLabel = useCallback((): string => {
    if (!selectedMonth) return getCurrentDate();
    const lastDayOfMonth = new Date(selectedMonth.year, selectedMonth.month, 0);
    return lastDayOfMonth.toLocaleDateString("default", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }, [selectedMonth]);

  return (
    <MonthYearFilterContext.Provider
      value={{
        selectedMonth,
        setSelectedMonth,
        getCurrentMonth,
        getSelectedMonthLabel,
        getSelectedDateLabel,
      }}
    >
      {children}
    </MonthYearFilterContext.Provider>
  );
};
