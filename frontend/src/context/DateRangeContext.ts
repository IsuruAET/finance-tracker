import { createContext, useContext } from "react";

export type DateRange = {
  startDate: Date;
  endDate: Date;
  label?: string;
};

type DateRangeContextType = {
  dateRange: DateRange;
  setDateRange: (range: DateRange) => void;
  getCurrentMonthRange: () => DateRange;
};

export const DateRangeContext = createContext<DateRangeContextType | undefined>(
  undefined
);

export const useDateRange = () => {
  const context = useContext(DateRangeContext);
  if (!context) {
    throw new Error("useDateRange must be used within DateRangeProvider");
  }
  return context;
};
