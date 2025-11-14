export interface DateFilterResult {
  isValid: boolean;
  error?: string;
  dateFilter?: { $gte: Date; $lte: Date };
}

/**
 * Validates and creates a date filter from query parameters
 * @param startDate - Start date query parameter (string)
 * @param endDate - End date query parameter (string)
 * @returns DateFilterResult with validation status and filter object
 */
export const validateAndCreateDateFilter = (
  startDate?: string,
  endDate?: string
): DateFilterResult => {
  // If neither is provided, return all records (no filter)
  if (!startDate && !endDate) {
    return { isValid: true };
  }

  // If only one is provided, return error
  if ((startDate && !endDate) || (!startDate && endDate)) {
    return {
      isValid: false,
      error: "Both startDate and endDate are required for date filtering",
    };
  }

  // Both are provided, validate and create filter
  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Validate dates
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return {
        isValid: false,
        error: "Invalid date format. Please use ISO 8601 format (YYYY-MM-DD)",
      };
    }

    // Check if parsed dates match input (catches invalid dates like 2025-11-31)
    const startISO = start.toISOString().split("T")[0];
    const endISO = end.toISOString().split("T")[0];
    if (startISO !== startDate || endISO !== endDate) {
      return {
        isValid: false,
        error: "Invalid date. Please provide a valid date in YYYY-MM-DD format",
      };
    }

    // Ensure startDate is before endDate
    if (start > end) {
      return {
        isValid: false,
        error: "startDate must be before or equal to endDate",
      };
    }

    // Set end date to end of day for inclusive filtering
    end.setHours(23, 59, 59, 999);

    return {
      isValid: true,
      dateFilter: {
        $gte: start,
        $lte: end,
      },
    };
  }

  return { isValid: true };
};
