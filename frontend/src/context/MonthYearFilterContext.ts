import { createContext, useContext } from "react";

type MonthYear = {
  month: number;
  year: number;
};

type MonthYearFilterContextType = {
  selectedMonth: MonthYear | null;
  setSelectedMonth: (month: MonthYear | null) => void;
  getCurrentMonth: () => MonthYear;
  getSelectedMonthLabel: () => string;
  getSelectedDateLabel: () => string;
};

export const MonthYearFilterContext = createContext<
  MonthYearFilterContextType | undefined
>(undefined);

export const useMonthYearFilter = () => {
  const context = useContext(MonthYearFilterContext);
  if (!context) {
    throw new Error(
      "useMonthYearFilter must be used within MonthYearFilterProvider"
    );
  }
  return context;
};
