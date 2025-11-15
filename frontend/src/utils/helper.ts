import { DateTime } from "luxon";
import type { Transaction } from "../types/dashboard";

export const validateEmail = (email: string): boolean => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

export const getInitials = (name: string): string =>
  name
    ? name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((word) => word[0].toUpperCase())
        .join("")
    : "";

export const addThousandsSeparator = (number: number): string => {
  if (number == null || isNaN(number)) return "";

  const hasDecimal = number % 1 !== 0;

  return number.toLocaleString("en-AU", {
    minimumFractionDigits: hasDecimal ? 2 : 0,
    maximumFractionDigits: 2,
  });
};

export const prepareExpenseBarChartData = (data: Transaction[] = []) => {
  return data.map((item) => ({
    title: item.category ?? "Unknown",
    yAxisValue: item.amount,
    xAxisValue: item.category ?? "Unknown",
  }));
};

export const formatDate = (date: string | Date): string => {
  const dt =
    date instanceof Date ? DateTime.fromJSDate(date) : DateTime.fromISO(date);
  return dt.toFormat("d MMM yyyy"); // e.g., "11 Nov 2025"
};

// Format dates as YYYY-MM-DD for API (using local time, not UTC)
export const formatLocalDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const prepareIncomeBarChartData = (data: Transaction[] = []) => {
  // Sort by date ascending
  const sortedData = [...data].sort((a, b) => {
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });

  // Map to chart data
  const chartData = sortedData.map((item) => ({
    title: item.source ?? "Unknown",
    yAxisValue: item.amount,
    xAxisValue: DateTime.fromJSDate(new Date(item.date)).toFormat("d MMM"),
  }));

  return chartData;
};

export const prepareExpenseLineChartData = (data: Transaction[] = []) => {
  // Sort by date ascending
  const sortedData = [...data].sort((a, b) => {
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });

  // Map to chart data
  const chartData = sortedData.map((item) => ({
    title: item.category ?? "Unknown",
    yAxisValue: item.amount,
    xAxisValue: DateTime.fromJSDate(new Date(item.date)).toFormat("d MMM"),
  }));

  return chartData;
};
