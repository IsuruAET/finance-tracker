import React, { useState, useRef, useEffect } from "react";
import { IoIosArrowDown } from "react-icons/io";

interface SelectOption {
  value: string;
  label: string;
  icon?: string;
}

interface SelectProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  placeholder?: string;
  label?: string;
  options: SelectOption[];
  required?: boolean;
}

const Select: React.FC<SelectProps> = ({
  value,
  onChange,
  placeholder,
  label,
  options,
  required = false,
}) => {
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [selectedValue, setSelectedValue] = useState<string>(
    value || options[0]?.value || ""
  );
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSelectedValue(value || options[0]?.value || "");
  }, [value, options]);

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

  const selectedOption = options.find((opt) => opt.value === selectedValue);
  const hasIcons = options.some((opt) => opt.icon);

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
            className="w-full bg-bg-primary dark:bg-bg-secondary border border-border rounded-lg px-4 py-3 mb-4 mt-3 flex items-center justify-between gap-2 text-sm text-text-primary cursor-pointer transition-colors hover:border-purple-500/50 min-w-0"
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
                  onClick={() => {
                    setIsDropdownVisible(false);
                  }}
                  className="px-4 py-2 text-sm text-text-secondary hover:bg-hover cursor-pointer transition-colors"
                >
                  {placeholder}
                </div>
              )}
              {options.map((option) => (
                <div
                  key={option.value}
                  onClick={() => handleSelect(option.value)}
                  className={`px-4 py-2 text-sm text-text-primary cursor-pointer hover:bg-hover transition-colors truncate ${
                    option.value === selectedValue
                      ? "bg-purple-50 dark:bg-purple-900/20"
                      : ""
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
          {options.map((option) => (
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
          className="w-full bg-bg-primary dark:bg-bg-secondary border border-border rounded-lg px-4 py-3 mb-4 mt-3 flex items-center justify-between gap-2 text-sm text-text-primary cursor-pointer transition-colors hover:border-purple-500/50 min-w-0"
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
                onClick={() => {
                  setIsDropdownVisible(false);
                }}
                className="px-4 py-2 text-sm text-text-secondary hover:bg-hover cursor-pointer transition-colors"
              >
                {placeholder}
              </div>
            )}
            {options.map((option) => (
              <div
                key={option.value}
                onClick={() => handleSelect(option.value)}
                className={`px-4 py-2 text-sm text-text-primary cursor-pointer flex items-center gap-2 hover:bg-hover transition-colors ${
                  option.value === selectedValue
                    ? "bg-purple-50 dark:bg-purple-900/20"
                    : ""
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
          {options.map((option) => (
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
