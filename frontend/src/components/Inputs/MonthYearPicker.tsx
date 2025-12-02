import { useState, useRef, useEffect } from "react";
import { DateTime } from "luxon";
import { HiCalendar } from "react-icons/hi";
import { IoChevronBack, IoChevronForward } from "react-icons/io5";

interface MonthYearPickerProps {
  value: { month: number; year: number } | null;
  onChange: (value: { month: number; year: number } | null) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
  minDate?: { month: number; year: number }; // Minimum selectable month/year
  maxDate?: { month: number; year: number }; // Maximum selectable month/year
}

const MonthYearPicker: React.FC<MonthYearPickerProps> = ({
  value,
  onChange,
  label,
  placeholder = "Select month and year",
  required = false,
  minDate,
  maxDate,
}) => {
  // Get minimum selectable date
  const getMinDate = (): { month: number; year: number } => {
    const now = DateTime.now();
    // Default to Jan of current year if no minDate provided
    if (!minDate) {
      return { month: 1, year: now.year };
    }

    return minDate;
  };

  // Get maximum selectable date
  const getMaxDate = (): { month: number; year: number } => {
    const now = DateTime.now();

    // Default max is the current month/year
    if (!maxDate) {
      return { month: now.month, year: now.year };
    }

    return maxDate;
  };

  const minDateValue = getMinDate();
  const maxDateValue = getMaxDate();
  const [isOpen, setIsOpen] = useState(false);
  const [currentYear, setCurrentYear] = useState(
    value?.year || minDateValue.year
  );
  const containerRef = useRef<HTMLDivElement>(null);

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  useEffect(() => {
    const handleClickAway = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickAway);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickAway);
    };
  }, [isOpen]);

  // Initialize current year from value if provided
  useEffect(() => {
    if (value?.year) {
      setCurrentYear(
        Math.min(
          Math.max(value.year, minDateValue.year),
          maxDateValue.year
        )
      );
    }
  }, [value, minDateValue.year, maxDateValue.year]);
  
  // Ensure current year is within bounds when opening
  useEffect(() => {
    if (!isOpen) return;

    if (currentYear < minDateValue.year) {
      setCurrentYear(minDateValue.year);
    } else if (currentYear > maxDateValue.year) {
      setCurrentYear(maxDateValue.year);
    }
  }, [isOpen, currentYear, minDateValue.year, maxDateValue.year]);

  const navigateYear = (direction: "prev" | "next") => {
    setCurrentYear((prev) => {
      if (direction === "prev") {
        // Don't allow navigating to years before minimum year
        return Math.max(minDateValue.year, prev - 1);
      }
      // Don't allow navigating to years after maximum year
      return Math.min(maxDateValue.year, prev + 1);
    });
  };

  const handleMonthClick = (month: number) => {
    const newValue = { month, year: currentYear }; // month is already 1-12
    onChange(newValue);
    setIsOpen(false);
  };

  const formatDisplayValue = (): string => {
    if (!value) return "";
    return `${months[value.month - 1]} ${value.year}`;
  };

  const isMonthDisabled = (monthIndex: number): boolean => {
    const month = monthIndex + 1; // Convert to 1-12
    const min = minDateValue;
    const max = maxDateValue;

    // Before min year or after max year
    if (currentYear < min.year || currentYear > max.year) return true;

    // Same year as min but before min month
    if (currentYear === min.year && month < min.month) return true;

    // Same year as max but after max month
    if (currentYear === max.year && month > max.month) return true;

    return false;
  };
  
  const canNavigateYearPrev = (): boolean => {
    return currentYear > minDateValue.year;
  };

  const isMonthSelected = (monthIndex: number): boolean => {
    if (!value) return false;
    return value.month === monthIndex + 1 && value.year === currentYear;
  };

  return (
    <div className="w-full" ref={containerRef}>
      {label && (
        <label className="block mb-2 text-sm font-medium text-text-primary transition-colors">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        <button
          type="button"
          className="w-full bg-bg-primary dark:bg-bg-secondary border border-border rounded-lg px-4 py-3 flex items-center gap-2 text-sm text-text-primary cursor-pointer transition-colors hover:border-purple-500/50"
          onClick={() => setIsOpen(!isOpen)}
        >
          <HiCalendar className="text-text-secondary text-base shrink-0 transition-colors" />
          <input
            type="text"
            readOnly
            value={formatDisplayValue()}
            className="outline-none cursor-pointer text-sm font-medium text-text-primary bg-transparent w-full transition-colors"
            placeholder={placeholder}
          />
        </button>

        {isOpen && (
          <div className="absolute top-full left-1/2 -translate-x-1/2 sm:left-auto sm:right-0 sm:translate-x-0 mt-2 bg-bg-primary dark:bg-bg-secondary border border-border rounded-lg shadow-lg dark:shadow-black/20 z-50 w-[calc(100vw-2rem)] max-w-[280px] sm:w-full sm:max-w-none p-4 transition-colors">
              {/* Year Navigation */}
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (canNavigateYearPrev()) {
                      navigateYear("prev");
                    }
                  }}
                  disabled={!canNavigateYearPrev()}
                  className={`p-1 rounded transition-colors ${
                    canNavigateYearPrev()
                      ? "hover:bg-hover"
                      : "opacity-50 cursor-not-allowed"
                  }`}
                >
                  <IoChevronBack className="text-text-secondary transition-colors" />
                </button>
                <h4 className="text-base font-semibold text-text-primary transition-colors">
                  {currentYear}
                </h4>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigateYear("next");
                  }}
                  className="p-1 hover:bg-hover rounded transition-colors"
                >
                  <IoChevronForward className="text-text-secondary transition-colors" />
                </button>
              </div>

              {/* Months Grid */}
              <div className="grid grid-cols-3 gap-2">
                {months.map((month, index) => {
                  const isDisabled = isMonthDisabled(index);
                  const isSelected = isMonthSelected(index);
                  const monthNumber = index + 1; // 1-12

                  return (
                    <button
                      key={month}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!isDisabled) {
                          handleMonthClick(monthNumber);
                        }
                      }}
                      disabled={isDisabled}
                      className={`px-3 py-2 text-sm rounded-md transition-colors ${
                        isSelected
                          ? "bg-primary text-white font-semibold"
                          : isDisabled
                          ? "bg-bg-secondary text-text-secondary cursor-not-allowed opacity-50"
                          : "bg-bg-secondary text-text-primary hover:bg-hover"
                      }`}
                    >
                      {month.substring(0, 3)}
                    </button>
                  );
                })}
              </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default MonthYearPicker;

