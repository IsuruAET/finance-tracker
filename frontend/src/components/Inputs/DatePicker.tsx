import { useState, useRef, useEffect } from "react";
import { DateTime } from "luxon";
import { HiCalendar } from "react-icons/hi";
import { IoChevronBack, IoChevronForward } from "react-icons/io5";

interface DatePickerProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
  minDate?: string; // ISO date string
}

const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  label,
  placeholder = "Select a date",
  required = false,
  minDate,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(DateTime.now());
  const containerRef = useRef<HTMLDivElement>(null);

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
      // Prevent body scroll on mobile when modal is open
      if (window.innerWidth < 640) {
        document.body.style.overflow = "hidden";
      }
    }

    return () => {
      document.removeEventListener("mousedown", handleClickAway);
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Initialize current month from value if provided
  useEffect(() => {
    if (value) {
      const date = DateTime.fromISO(value);
      if (date.isValid) {
        setCurrentMonth(date.startOf("month"));
      }
    }
  }, [value]);

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentMonth((prev) =>
      direction === "prev"
        ? prev.minus({ months: 1 })
        : prev.plus({ months: 1 })
    );
  };

  const handleDateClick = (date: Date) => {
    const dateTime = DateTime.fromJSDate(date);
    onChange(dateTime.toISODate() || "");
    setIsOpen(false);
  };

  const formatDisplayDate = (dateString: string): string => {
    if (!dateString) return "";
    const date = DateTime.fromISO(dateString);
    if (!date.isValid) return "";
    return date.toFormat("MMM dd, yyyy");
  };

  // Generate calendar days
  const generateCalendarDays = () => {
    const startOfMonth = currentMonth.startOf("month");
    const endOfMonth = currentMonth.endOf("month");
    const startOfCalendar = startOfMonth.startOf("week");
    const endOfCalendar = endOfMonth.endOf("week");

    const days: (Date | null)[] = [];
    let current = startOfCalendar;

    while (current <= endOfCalendar) {
      if (current >= startOfMonth && current <= endOfMonth) {
        days.push(current.toJSDate());
      } else {
        days.push(null);
      }
      current = current.plus({ days: 1 });
    }

    return days;
  };

  const days = generateCalendarDays();
  const weekDays = ["M", "T", "W", "T", "F", "S", "S"];
  const selectedDate = value ? DateTime.fromISO(value) : null;
  const today = DateTime.now();
  const minDateTime = minDate ? DateTime.fromISO(minDate) : null;

  return (
    <div>
      {label && (
        <label className="text-[13px] text-text-secondary transition-colors mb-1 block">
          {label}
        </label>
      )}

      <div className="relative" ref={containerRef}>
        <div
          className="w-full bg-bg-primary dark:bg-bg-secondary border border-border rounded-lg px-4 py-3 mb-4 mt-3 flex items-center gap-2 text-sm text-text-primary transition-colors hover:border-purple-500/50 cursor-pointer"
          onClick={() => setIsOpen(!isOpen)}
        >
          <HiCalendar className="text-text-secondary text-base shrink-0 transition-colors" />
          <input
            type="text"
            readOnly
            value={formatDisplayDate(value)}
            placeholder={placeholder}
            className="w-full bg-transparent outline-none cursor-pointer text-base text-text-primary placeholder:text-text-secondary transition-colors"
          />
        </div>

        {isOpen && (
          <>
            {/* Backdrop for mobile */}
            <div
              className="fixed inset-0 bg-black/50 z-40 sm:hidden"
              onClick={() => setIsOpen(false)}
            />

            {/* Calendar - Modal on mobile, dropdown on desktop */}
            <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 sm:absolute sm:inset-x-0 sm:top-full sm:translate-y-0 sm:left-0 sm:mt-1 bg-bg-primary dark:bg-bg-secondary border border-border rounded-lg shadow-lg dark:shadow-black/50 z-50 p-4 sm:p-3 w-auto sm:w-[280px] max-w-sm sm:max-w-none mx-auto transition-colors">
              {/* Month Navigation */}
              <div className="flex items-center justify-between mb-3">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigateMonth("prev");
                  }}
                  className="p-1 hover:bg-hover rounded transition-colors"
                >
                  <IoChevronBack className="text-text-secondary text-sm transition-colors" />
                </button>
                <h4 className="text-sm sm:text-sm font-semibold text-text-primary transition-colors">
                  {currentMonth.toFormat("MMMM yyyy")}
                </h4>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigateMonth("next");
                  }}
                  className="p-1 hover:bg-hover rounded transition-colors"
                >
                  <IoChevronForward className="text-text-secondary text-sm transition-colors" />
                </button>
              </div>

              {/* Week Days Header */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {weekDays.map((day, idx) => (
                  <div
                    key={idx}
                    className="text-center text-xs font-medium text-text-secondary py-1 transition-colors"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Days */}
              <div className="grid grid-cols-7 gap-1">
                {days.map((date, idx) => {
                  if (!date) {
                    return (
                      <div key={`empty-${idx}`} className="aspect-square" />
                    );
                  }

                  const dateTime = DateTime.fromJSDate(date);
                  const isSelected =
                    selectedDate &&
                    dateTime.toISODate() === selectedDate.toISODate();
                  const isToday = dateTime.toISODate() === today.toISODate();
                  const isDisabled = minDateTime
                    ? dateTime < minDateTime.startOf("day")
                    : false;

                  return (
                    <button
                      key={date.toISOString()}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!isDisabled) {
                          handleDateClick(date);
                        }
                      }}
                      disabled={isDisabled}
                      className={`aspect-square text-sm sm:text-xs rounded-md transition-colors flex items-center justify-center ${
                        isDisabled
                          ? "text-text-secondary opacity-40 cursor-not-allowed"
                          : isSelected
                          ? "bg-primary text-white font-semibold"
                          : isToday
                          ? "bg-bg-secondary dark:bg-hover text-text-primary font-medium"
                          : "text-text-primary hover:bg-hover"
                      }`}
                    >
                      {dateTime.day}
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {/* Hidden input for form validation */}
        <input
          type="date"
          value={value}
          onChange={() => {}}
          className="hidden"
          required={required}
        />
      </div>
    </div>
  );
};

export default DatePicker;
