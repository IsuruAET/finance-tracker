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
}

const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  label,
  placeholder = "Select a date",
  required = false,
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

    document.addEventListener("mousedown", handleClickAway);
    return () => {
      document.removeEventListener("mousedown", handleClickAway);
    };
  }, []);

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
            className="w-full bg-transparent outline-none cursor-pointer text-text-primary placeholder:text-text-secondary transition-colors"
          />
        </div>

        {isOpen && (
          <div className="absolute top-full left-0 mt-1 bg-bg-primary dark:bg-bg-secondary border border-border rounded-lg shadow-lg dark:shadow-black/50 z-50 p-3 w-full sm:w-[280px] transition-colors">
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
              <h4 className="text-xs sm:text-sm font-semibold text-text-primary transition-colors">
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
                  className="text-center text-[10px] sm:text-xs font-medium text-text-secondary py-1 transition-colors"
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

                return (
                  <button
                    key={date.toISOString()}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDateClick(date);
                    }}
                    className={`aspect-square text-xs rounded-md transition-colors flex items-center justify-center ${
                      isSelected
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

