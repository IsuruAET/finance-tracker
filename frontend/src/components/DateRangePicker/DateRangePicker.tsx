import {
  useState,
  useRef,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import { DateTime } from "luxon";
import { useDateRange, type DateRange } from "../../context/DateRangeContext";
import { HiCalendar } from "react-icons/hi";
import { IoChevronBack, IoChevronForward } from "react-icons/io5";

type PredefinedRange = {
  label: string;
  getRange: () => DateRange;
};

export type DateRangePickerRef = {
  open: () => void;
};

const DateRangePicker = forwardRef<DateRangePickerRef>((_props, ref) => {
  const { dateRange, setDateRange } = useDateRange();
  const [isOpen, setIsOpen] = useState(false);
  const [showCustomPicker, setShowCustomPicker] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(DateTime.now());
  const [selectedStartDate, setSelectedStartDate] = useState<Date | null>(null);
  const [selectedEndDate, setSelectedEndDate] = useState<Date | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Predefined ranges
  const predefinedRanges: PredefinedRange[] = [
    {
      label: "Today",
      getRange: () => {
        const today = DateTime.now();
        return {
          startDate: today.startOf("day").toJSDate(),
          endDate: today.startOf("day").toJSDate(),
          label: "Today",
        };
      },
    },
    {
      label: "Last Day",
      getRange: () => {
        const lastDay = DateTime.now().minus({ days: 1 });
        return {
          startDate: lastDay.startOf("day").toJSDate(),
          endDate: lastDay.startOf("day").toJSDate(),
          label: "Last Day",
        };
      },
    },
    {
      label: "This Week",
      getRange: () => {
        const now = DateTime.now();
        return {
          startDate: now.startOf("week").toJSDate(),
          endDate: now.endOf("week").startOf("day").toJSDate(),
          label: "This Week",
        };
      },
    },
    {
      label: "Last Week",
      getRange: () => {
        const lastWeek = DateTime.now().minus({ weeks: 1 });
        return {
          startDate: lastWeek.startOf("week").toJSDate(),
          endDate: lastWeek.endOf("week").startOf("day").toJSDate(),
          label: "Last Week",
        };
      },
    },
    {
      label: "This Month",
      getRange: () => {
        const now = DateTime.now();
        return {
          startDate: now.startOf("month").toJSDate(),
          endDate: now.endOf("month").startOf("day").toJSDate(),
          label: "This Month",
        };
      },
    },
    {
      label: "Last Month",
      getRange: () => {
        const now = DateTime.now();
        const lastMonth = now.minus({ months: 1 });
        return {
          startDate: lastMonth.startOf("month").toJSDate(),
          endDate: lastMonth.endOf("month").startOf("day").toJSDate(),
          label: "Last Month",
        };
      },
    },
    {
      label: "This Year",
      getRange: () => {
        const now = DateTime.now();
        return {
          startDate: now.startOf("year").toJSDate(),
          endDate: now.endOf("year").startOf("day").toJSDate(),
          label: "This Year",
        };
      },
    },
    {
      label: "Last Year",
      getRange: () => {
        const now = DateTime.now();
        const lastYear = now.minus({ years: 1 });
        return {
          startDate: lastYear.startOf("year").toJSDate(),
          endDate: lastYear.endOf("year").startOf("day").toJSDate(),
          label: "Last Year",
        };
      },
    },
  ];

  // Format date for display
  const formatDateRange = (range: DateRange): string => {
    const start = DateTime.fromJSDate(range.startDate).toFormat("MM/dd/yyyy");
    const end = DateTime.fromJSDate(range.endDate).toFormat("MM/dd/yyyy");
    return `${start} - ${end}`;
  };

  // Check if date range matches a predefined range
  const isRangeMatch = (range: PredefinedRange): boolean => {
    if (dateRange.label === range.label) return true;
    // Also check if dates match (handles "Current Month" vs "This Month")
    const predefinedRange = range.getRange();
    const currentStart = DateTime.fromJSDate(dateRange.startDate).toISODate();
    const currentEnd = DateTime.fromJSDate(dateRange.endDate).toISODate();
    const predefinedStart = DateTime.fromJSDate(
      predefinedRange.startDate
    ).toISODate();
    const predefinedEnd = DateTime.fromJSDate(
      predefinedRange.endDate
    ).toISODate();
    return currentStart === predefinedStart && currentEnd === predefinedEnd;
  };

  // Handle predefined range selection
  const handlePredefinedRange = (range: PredefinedRange) => {
    const newRange = range.getRange();
    setDateRange(newRange);
    setIsOpen(false);
    setShowCustomPicker(false);
  };

  // Handle custom date selection
  const handleDateClick = (date: Date) => {
    if (!isSelecting || !selectedStartDate) {
      // Start new selection
      setSelectedStartDate(date);
      setSelectedEndDate(null);
      setIsSelecting(true);
    } else {
      // Complete selection
      if (date < selectedStartDate) {
        // If clicked date is before start, swap them
        setSelectedEndDate(selectedStartDate);
        setSelectedStartDate(date);
      } else {
        setSelectedEndDate(date);
      }
      setIsSelecting(false);
    }
  };

  // Apply custom range
  const applyCustomRange = () => {
    if (selectedStartDate && selectedEndDate) {
      setDateRange({
        startDate: DateTime.fromJSDate(selectedStartDate)
          .startOf("day")
          .toJSDate(),
        endDate: DateTime.fromJSDate(selectedEndDate).startOf("day").toJSDate(),
        label: "Custom Range",
      });
      setIsOpen(false);
      setShowCustomPicker(false);
      setSelectedStartDate(null);
      setSelectedEndDate(null);
    }
  };

  // Cancel custom selection
  const cancelCustomSelection = () => {
    setSelectedStartDate(null);
    setSelectedEndDate(null);
    setIsSelecting(false);
    setShowCustomPicker(false);
  };

  // Generate calendar days
  const generateCalendarDays = (month: DateTime) => {
    const start = month.startOf("month");
    const end = month.endOf("month");
    // Luxon weekday: 1=Monday, 2=Tuesday, ..., 7=Sunday
    // Calendar grid: 0=Monday, 1=Tuesday, ..., 6=Sunday
    const startDay = (start.weekday - 1) % 7; // Convert to 0-based where 0=Monday
    const daysInMonth = end.day;
    const days: (Date | null)[] = [];

    // Add empty cells for days before month starts
    for (let i = 0; i < startDay; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(start.set({ day }).toJSDate());
    }

    return days;
  };

  // Check if date is in range
  const isDateInRange = (date: Date): boolean => {
    if (!selectedStartDate) return false;
    if (!selectedEndDate) {
      return (
        DateTime.fromJSDate(date).toISODate() ===
        DateTime.fromJSDate(selectedStartDate).toISODate()
      );
    }
    const dateTime = DateTime.fromJSDate(date);
    const start = DateTime.fromJSDate(selectedStartDate);
    const end = DateTime.fromJSDate(selectedEndDate);
    return dateTime >= start.startOf("day") && dateTime <= end.endOf("day");
  };

  // Check if date is selected
  const isDateSelected = (date: Date): boolean => {
    if (selectedStartDate) {
      const dateTime = DateTime.fromJSDate(date);
      const start = DateTime.fromJSDate(selectedStartDate);
      if (selectedEndDate) {
        const end = DateTime.fromJSDate(selectedEndDate);
        return (
          dateTime.toISODate() === start.toISODate() ||
          dateTime.toISODate() === end.toISODate()
        );
      }
      return dateTime.toISODate() === start.toISODate();
    }
    return false;
  };

  // Navigate months
  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentMonth((prev) =>
      direction === "prev"
        ? prev.minus({ months: 1 })
        : prev.plus({ months: 1 })
    );
  };

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setShowCustomPicker(false);
        setSelectedStartDate(null);
        setSelectedEndDate(null);
        setIsSelecting(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Initialize custom picker with current range
  const openCustomPicker = () => {
    setSelectedStartDate(dateRange.startDate);
    setSelectedEndDate(dateRange.endDate);
    setIsSelecting(false);
    setShowCustomPicker(true);
  };

  // Expose open method via ref
  useImperativeHandle(ref, () => ({
    open: () => {
      setIsOpen(true);
    },
  }));

  const days1 = generateCalendarDays(currentMonth);
  const days2 = generateCalendarDays(currentMonth.plus({ months: 1 }));
  const weekDays = ["M", "T", "W", "T", "F", "S", "S"];

  return (
    <div className="relative" ref={containerRef}>
      {/* Date Range Input */}
      <div
        className="flex items-center gap-2 px-2 sm:px-3 py-2 border border-border rounded-lg cursor-pointer hover:border-primary/50 transition-colors bg-bg-primary"
        onClick={() => setIsOpen(!isOpen)}
      >
        <HiCalendar className="text-text-secondary text-base sm:text-lg shrink-0 transition-colors" />
        <input
          type="text"
          readOnly
          value={formatDateRange(dateRange)}
          className="outline-none cursor-pointer text-base sm:text-sm font-medium text-text-primary bg-transparent w-full min-w-[140px] sm:min-w-[200px] transition-colors"
          placeholder="Select date range"
        />
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 sm:left-auto sm:right-0 sm:translate-x-0 mt-2 bg-bg-primary border border-border rounded-lg shadow-lg dark:shadow-black/20 z-50 w-[calc(100vw-2rem)] max-w-[700px] sm:w-auto max-h-[85vh] overflow-y-auto transition-colors">
          {!showCustomPicker ? (
            // Predefined Ranges
            <div className="p-4">
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-text-primary mb-2 transition-colors">
                  Quick Select
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {predefinedRanges.map((range) => (
                    <button
                      key={range.label}
                      onClick={() => handlePredefinedRange(range)}
                      className={`px-3 py-2 text-sm rounded-md transition-colors ${
                        isRangeMatch(range)
                          ? "bg-primary text-white"
                          : "bg-bg-secondary text-text-primary hover:bg-hover"
                      }`}
                    >
                      {range.label}
                    </button>
                  ))}
                </div>
              </div>
              <button
                onClick={openCustomPicker}
                className="w-full px-4 py-2 text-sm font-medium text-primary border border-primary rounded-md hover:bg-primary/10 transition-colors"
              >
                Custom Range
              </button>
            </div>
          ) : (
            // Custom Date Picker
            <div className="p-4 pb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-text-primary transition-colors">
                  Select Date Range
                </h3>
                <button
                  onClick={cancelCustomSelection}
                  className="text-sm text-text-secondary hover:text-text-primary transition-colors"
                >
                  Cancel
                </button>
              </div>

              {/* Two Month Calendars */}
              <div className="flex flex-col sm:flex-row gap-4 mb-4">
                {/* First Calendar */}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <button
                      onClick={() => navigateMonth("prev")}
                      className="p-1 hover:bg-hover rounded transition-colors"
                    >
                      <IoChevronBack className="text-text-secondary transition-colors" />
                    </button>
                    <h4 className="text-sm font-semibold text-text-primary transition-colors">
                      {currentMonth.toFormat("MMMM yyyy")}
                    </h4>
                    <div className="w-6" /> {/* Spacer */}
                  </div>
                  <div className="grid grid-cols-7 gap-1">
                    {weekDays.map((day) => (
                      <div
                        key={day}
                        className="text-center text-xs font-medium text-text-secondary py-1 transition-colors"
                      >
                        {day}
                      </div>
                    ))}
                    {days1.map((date, idx) => {
                      if (!date) {
                        return (
                          <div key={`empty-${idx}`} className="aspect-square" />
                        );
                      }
                      const isInRange = isDateInRange(date);
                      const isSelected = isDateSelected(date);
                      const isToday =
                        DateTime.fromJSDate(date).toISODate() ===
                        DateTime.now().toISODate();

                      return (
                        <button
                          key={date.toISOString()}
                          onClick={() => handleDateClick(date)}
                          className={`aspect-square text-xs rounded-md transition-colors ${
                            isSelected
                              ? "bg-primary text-white font-semibold"
                              : isInRange
                              ? "bg-primary/20 text-primary"
                              : isToday
                              ? "bg-bg-secondary dark:bg-hover text-text-primary font-medium"
                              : "text-text-primary hover:bg-hover"
                          }`}
                        >
                          {DateTime.fromJSDate(date).day}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Second Calendar */}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-6" /> {/* Spacer */}
                    <h4 className="text-sm font-semibold text-text-primary transition-colors">
                      {currentMonth.plus({ months: 1 }).toFormat("MMMM yyyy")}
                    </h4>
                    <button
                      onClick={() => navigateMonth("next")}
                      className="p-1 hover:bg-hover rounded transition-colors"
                    >
                      <IoChevronForward className="text-text-secondary transition-colors" />
                    </button>
                  </div>
                  <div className="grid grid-cols-7 gap-1">
                    {weekDays.map((day) => (
                      <div
                        key={day}
                        className="text-center text-xs font-medium text-text-secondary py-1 transition-colors"
                      >
                        {day}
                      </div>
                    ))}
                    {days2.map((date, idx) => {
                      if (!date) {
                        return (
                          <div key={`empty-${idx}`} className="aspect-square" />
                        );
                      }
                      const isInRange = isDateInRange(date);
                      const isSelected = isDateSelected(date);
                      const isToday =
                        DateTime.fromJSDate(date).toISODate() ===
                        DateTime.now().toISODate();

                      return (
                        <button
                          key={date.toISOString()}
                          onClick={() => handleDateClick(date)}
                          className={`aspect-square text-xs rounded-md transition-colors ${
                            isSelected
                              ? "bg-primary text-white font-semibold"
                              : isInRange
                              ? "bg-primary/20 text-primary"
                              : isToday
                              ? "bg-bg-secondary dark:bg-hover text-text-primary font-medium"
                              : "text-text-primary hover:bg-hover"
                          }`}
                        >
                          {DateTime.fromJSDate(date).day}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Apply Button */}
              <button
                onClick={applyCustomRange}
                disabled={!selectedStartDate || !selectedEndDate}
                className="w-full px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary/90 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:text-gray-500 dark:disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                Apply
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
});

DateRangePicker.displayName = "DateRangePicker";

export default DateRangePicker;
