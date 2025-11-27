import React, { useState, useRef, useEffect } from "react";
import { IoIosArrowDown } from "react-icons/io";

interface SelectOption {
  value: string;
  label: string;
  icon?: string;
}

interface SelectGroup {
  label: string;
  options: SelectOption[];
}

interface SelectProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  placeholder?: string;
  label?: string;
  options?: SelectOption[];
  groups?: SelectGroup[];
  required?: boolean;
  compact?: boolean;
}

const Select: React.FC<SelectProps> = ({
  value,
  onChange,
  placeholder,
  label,
  options = [],
  groups,
  required = false,
  compact = false,
}) => {
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);

  // Flatten groups to get all options for finding selected option
  const allOptions = groups
    ? groups.flatMap((group) => group.options)
    : options;

  const [selectedValue, setSelectedValue] = useState<string>(value);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSelectedValue(value);
  }, [value]);

  useEffect(() => {
    const handleClickAway = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownVisible(false);
      }
    };

    document.addEventListener("mousedown", handleClickAway);
    return () => {
      document.removeEventListener("mousedown", handleClickAway);
    };
  }, []);

  const handleSelect = (optionValue: string) => {
    setSelectedValue(optionValue);
    const syntheticEvent = {
      target: { value: optionValue },
    } as React.ChangeEvent<HTMLSelectElement>;
    onChange(syntheticEvent);
    setIsDropdownVisible(false);
  };

  const selectedOption = allOptions.find((opt) => opt.value === selectedValue);
  const hasIcons = allOptions.some((opt) => opt.icon);

  if (!hasIcons) {
    return (
      <div>
        {label && (
          <label className="text-[13px] text-text-secondary transition-colors mb-1 block">
            {label}
          </label>
        )}

        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsDropdownVisible(!isDropdownVisible)}
            className={`w-full bg-bg-primary dark:bg-bg-secondary border border-border rounded-lg px-4 py-3 flex items-center justify-between gap-2 text-sm text-text-primary cursor-pointer transition-colors hover:border-purple-500/50 min-w-0 ${
              compact ? "" : "mb-4 mt-3"
            }`}
          >
            <span className="flex-1 text-left truncate min-w-0">
              {selectedOption?.label || placeholder || "Select..."}
            </span>
            <IoIosArrowDown
              className={`w-4 h-4 text-text-secondary transition-transform duration-200 shrink-0 ${
                isDropdownVisible ? "rotate-180" : ""
              }`}
            />
          </button>

          {isDropdownVisible && (
            <div className="absolute z-50 w-full mt-1 bg-bg-primary dark:bg-bg-secondary border border-border rounded-lg shadow-lg dark:shadow-black/50 overflow-hidden">
              {placeholder && (
                <div
                  onClick={() => handleSelect("")}
                  className="px-4 py-2 text-sm text-text-secondary hover:bg-hover cursor-pointer transition-colors"
                >
                  {placeholder}
                </div>
              )}
              {groups
                ? groups.map((group, groupIndex) => (
                    <div key={group.label}>
                      <div
                        className={`px-4 py-1.5 text-[11px] font-semibold text-text-secondary/70 dark:text-text-secondary/60 uppercase tracking-wider bg-gray-50 dark:bg-gray-800/50 sticky top-0 pointer-events-none select-none ${
                          groupIndex > 0 ? "border-t border-border/50" : ""
                        }`}
                      >
                        {group.label}
                      </div>
                      {group.options.map((option) => (
                        <div
                          key={option.value}
                          onClick={() => handleSelect(option.value)}
                          className={`px-4 py-2 text-sm cursor-pointer hover:bg-hover transition-colors truncate ${
                            option.value === selectedValue
                              ? "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 font-medium"
                              : "text-text-primary"
                          }`}
                        >
                          {option.label}
                        </div>
                      ))}
                    </div>
                  ))
                : options.map((option) => (
                    <div
                      key={option.value}
                      onClick={() => handleSelect(option.value)}
                      className={`px-4 py-2 text-sm cursor-pointer hover:bg-hover transition-colors truncate ${
                        option.value === selectedValue
                          ? "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 font-medium"
                          : "text-text-primary"
                      }`}
                    >
                      {option.label}
                    </div>
                  ))}
            </div>
          )}
        </div>

        <select
          value={selectedValue}
          onChange={onChange}
          className="hidden"
          required={required}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {groups
            ? groups.map((group) => (
                <optgroup key={group.label} label={group.label}>
                  {group.options.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </optgroup>
              ))
            : options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
        </select>
      </div>
    );
  }

  return (
    <div>
      {label && (
        <label className="text-[13px] text-text-secondary transition-colors mb-1 block">
          {label}
        </label>
      )}

      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setIsDropdownVisible(!isDropdownVisible)}
          className={`w-full bg-bg-primary dark:bg-bg-secondary border border-border rounded-lg px-4 py-3 flex items-center justify-between gap-2 text-sm text-text-primary cursor-pointer transition-colors hover:border-purple-500/50 min-w-0 ${
            compact ? "" : "mb-4 mt-3"
          }`}
        >
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {selectedOption?.icon && (
              <img
                src={selectedOption.icon}
                alt=""
                className="w-5 h-5 object-contain shrink-0"
              />
            )}
            <span className="truncate">
              {selectedOption?.label || placeholder || "Select..."}
            </span>
          </div>
          <IoIosArrowDown
            className={`w-4 h-4 text-text-secondary transition-transform duration-200 shrink-0 ${
              isDropdownVisible ? "rotate-180" : ""
            }`}
          />
        </button>

        {isDropdownVisible && (
          <div className="absolute z-50 w-full mt-1 bg-bg-primary dark:bg-bg-secondary border border-border rounded-lg shadow-lg dark:shadow-black/50 max-h-60 overflow-auto">
            {placeholder && (
              <div
                onClick={() => handleSelect("")}
                className="px-4 py-2 text-sm text-text-secondary hover:bg-hover cursor-pointer transition-colors"
              >
                {placeholder}
              </div>
            )}
            {groups
              ? groups.map((group, groupIndex) => (
                  <div key={group.label}>
                    <div
                      className={`px-4 py-1.5 text-[11px] font-semibold text-text-secondary/70 dark:text-text-secondary/60 uppercase tracking-wider bg-gray-50 dark:bg-gray-800/50 sticky top-0 pointer-events-none select-none ${
                        groupIndex > 0 ? "border-t border-border/50" : ""
                      }`}
                    >
                      {group.label}
                    </div>
                    {group.options.map((option) => (
                      <div
                        key={option.value}
                        onClick={() => handleSelect(option.value)}
                        className={`px-4 py-2 text-sm cursor-pointer flex items-center gap-2 hover:bg-hover transition-colors ${
                          option.value === selectedValue
                            ? "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 font-medium"
                            : "text-text-primary"
                        }`}
                      >
                        {option.icon && (
                          <img
                            src={option.icon}
                            alt=""
                            className="w-5 h-5 object-contain shrink-0"
                          />
                        )}
                        <span className="truncate">{option.label}</span>
                      </div>
                    ))}
                  </div>
                ))
              : options.map((option) => (
                  <div
                    key={option.value}
                    onClick={() => handleSelect(option.value)}
                    className={`px-4 py-2 text-sm cursor-pointer flex items-center gap-2 hover:bg-hover transition-colors ${
                      option.value === selectedValue
                        ? "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 font-medium"
                        : "text-text-primary"
                    }`}
                  >
                    {option.icon && (
                      <img
                        src={option.icon}
                        alt=""
                        className="w-5 h-5 object-contain shrink-0"
                      />
                    )}
                    <span className="truncate">{option.label}</span>
                  </div>
                ))}
          </div>
        )}

        <select
          value={selectedValue}
          onChange={onChange}
          className="hidden"
          required={required}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {groups
            ? groups.map((group) => (
                <optgroup key={group.label} label={group.label}>
                  {group.options.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </optgroup>
              ))
            : options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
        </select>
      </div>
    </div>
  );
};

export default Select;
