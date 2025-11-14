import { useState, useCallback } from "react";
import { DateTime } from "luxon";
import { DateRangeContext, type DateRange } from "./DateRangeContext";

export const DateRangeProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const getCurrentMonthRange = useCallback(() => {
    const now = DateTime.now();
    return {
      startDate: now.startOf("month").toJSDate(),
      endDate: now.endOf("month").toJSDate(),
      label: "Current Month",
    };
  }, []);

  const [dateRange, setDateRangeState] = useState<DateRange>(
    getCurrentMonthRange()
  );

  const setDateRange = useCallback((range: DateRange) => {
    setDateRangeState(range);
  }, []);

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
