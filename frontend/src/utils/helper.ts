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

export const addThousandsSeparator = (number: number): string => {
  if (number == null || isNaN(number)) return "";

  const hasDecimal = number % 1 !== 0;

  return number.toLocaleString("en-AU", {
    minimumFractionDigits: hasDecimal ? 2 : 0,
    maximumFractionDigits: 2,
  });
};

export const prepareExpenseBarChartData = (
  data: TransactionApiResponse[] = []
) => {
  return data.map((item) => ({
    title: item.categoryId?.name ?? item.desc ?? "Unknown",
    yAxisValue: item.amount,
    xAxisValue: item.categoryId?.name ?? item.desc ?? "Unknown",
  }));
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
  const chartData = sortedData.map((item) => ({
    title: item.categoryId?.name ?? item.desc ?? "Unknown",
    yAxisValue: item.amount,
    xAxisValue: DateTime.fromJSDate(new Date(item.date)).toFormat("d MMM"),
  }));

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
