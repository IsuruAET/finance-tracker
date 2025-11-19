import { DateTime } from "luxon";
import type { TransactionApiResponse } from "../types/dashboard";
import axiosInstance from "./axiosInstance";
import { API_PATHS } from "./apiPaths";

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

export const formatCurrency = (number: number): string => {
  if (number == null || isNaN(number)) return "";

  // Round to 2 decimal places
  const rounded = Math.round(number * 100) / 100;

  // Check if the rounded number has decimal part
  const hasDecimal = rounded % 1 !== 0;

  const formatted = rounded.toLocaleString("en-AU", {
    minimumFractionDigits: hasDecimal ? 2 : 0,
    maximumFractionDigits: 2,
  });

  return `AU$${formatted}`;
};

export const prepareExpenseBarChartData = (
  data: TransactionApiResponse[] = []
) => {
  // Group transactions by category and sum amounts
  const categoryMap = new Map<string, number>();

  data.forEach((item) => {
    const categoryName = item.categoryId?.name ?? item.desc ?? "Unknown";
    const currentAmount = categoryMap.get(categoryName) || 0;
    categoryMap.set(categoryName, currentAmount + item.amount);
  });

  // Convert map to array, sort by amount descending, and take top 7
  return Array.from(categoryMap.entries())
    .map(([categoryName, totalAmount]) => ({
      title: categoryName,
      yAxisValue: totalAmount,
      xAxisValue: categoryName,
    }))
    .sort((a, b) => b.yAxisValue - a.yAxisValue)
    .slice(0, 7);
};

export const formatDate = (date: string | Date): string => {
  const dt =
    date instanceof Date ? DateTime.fromJSDate(date) : DateTime.fromISO(date);
  return dt.toFormat("MMM d, yyyy"); // e.g., "Jan 5, 2025"
};

// Format dates as YYYY-MM-DD for API (using local time, not UTC)
export const formatLocalDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const prepareIncomeBarChartData = (
  data: TransactionApiResponse[] = []
) => {
  // Sort by date ascending
  const sortedData = [...data].sort((a, b) => {
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });

  // Map to chart data
  const chartData = sortedData.map((item) => {
    const date = DateTime.fromJSDate(new Date(item.date)).toFormat("d MMM");
    const desc = item.desc ?? item.categoryId?.name ?? "Unknown";
    return {
      title: item.categoryId?.name ?? item.desc ?? "Unknown",
      yAxisValue: item.amount,
      xAxisValue: `${date} - ${desc}`,
      desc: item.desc,
    };
  });

  return chartData;
};

export const prepareExpenseLineChartData = (
  data: TransactionApiResponse[] = []
) => {
  // Sort by date ascending
  const sortedData = [...data].sort((a, b) => {
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });

  // Group expenses by date and sum amounts
  const dateMap = new Map<string, number>();

  sortedData.forEach((item) => {
    const dateKey = DateTime.fromJSDate(new Date(item.date)).toFormat("d MMM");
    const currentAmount = dateMap.get(dateKey) || 0;
    dateMap.set(dateKey, currentAmount + item.amount);
  });

  // Convert map to chart data array
  const chartData = Array.from(dateMap.entries()).map(
    ([date, totalAmount]) => ({
      title: "Total Expenses",
      yAxisValue: totalAmount,
      xAxisValue: date,
    })
  );

  return chartData;
};

interface Category {
  _id: string;
  name: string;
  type: "INCOME" | "EXPENSE";
  icon: string;
  isDefault?: boolean;
  userId?: string;
}

// Find or create a category by name and type
export const findOrCreateCategory = async (
  name: string,
  type: "INCOME" | "EXPENSE",
  icon?: string
): Promise<string | null> => {
  try {
    // First, try to get all categories and find a match
    const response = await axiosInstance.get<{
      default?: Category[];
      custom?: Category[];
    }>(API_PATHS.CATEGORIES.GET_ALL, {
      params: { type },
    });

    const allCategories: Category[] = [
      ...(response.data?.default || []),
      ...(response.data?.custom || []),
    ];

    // Find existing category by name (case-insensitive)
    const existingCategory = allCategories.find(
      (cat: Category) => cat.name.toLowerCase() === name.trim().toLowerCase()
    );

    if (existingCategory) {
      return existingCategory._id;
    }

    // Create new category if not found
    const createResponse = await axiosInstance.post(API_PATHS.CATEGORIES.ADD, {
      name: name.trim(),
      type,
      icon: icon || "💰",
    });

    return createResponse.data?._id || null;
  } catch (error) {
    console.error("Error finding or creating category:", error);
    return null;
  }
};

export const getCurrentMonthYear = () => {
  return DateTime.now().toFormat("MMMM yyyy");
};

// Group transactions by date
export const groupTransactionsByDate = (
  transactions: TransactionApiResponse[]
): Map<string, TransactionApiResponse[]> => {
  const grouped = new Map<string, TransactionApiResponse[]>();

  transactions.forEach((transaction) => {
    const dateKey = DateTime.fromISO(transaction.date).toISODate() || "";
    if (!grouped.has(dateKey)) {
      grouped.set(dateKey, []);
    }
    grouped.get(dateKey)?.push(transaction);
  });

  // Sort transactions within each date group (newest first)
  grouped.forEach((transactions) => {
    transactions.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  });

  return grouped;
};

// Format date header with relative labels
export const formatDateHeader = (dateString: string): string => {
  const dt = DateTime.fromISO(dateString);
  const now = DateTime.now();
  const today = now.startOf("day");
  const yesterday = today.minus({ days: 1 });
  const dateStart = dt.startOf("day");

  if (dateStart.equals(today)) {
    return "Today";
  } else if (dateStart.equals(yesterday)) {
    return "Yesterday";
  } else if (dateStart > today.minus({ days: 7 })) {
    return dt.toFormat("EEEE"); // Day name (Monday, Tuesday, etc.)
  } else if (dateStart.year === today.year) {
    return dt.toFormat("MMM d"); // "Jan 15"
  } else {
    return dt.toFormat("MMM d, yyyy"); // "Jan 15, 2024"
  }
};
