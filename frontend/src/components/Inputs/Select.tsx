import React, { useState, useRef, useEffect } from "react";

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
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState<SelectOption | null>(
    options.find((opt) => opt.value === value) || null
  );
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const option = options.find((opt) => opt.value === value);
    setSelectedOption(option || null);
  }, [value, options]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSelect = (option: SelectOption) => {
    const syntheticEvent = {
      target: { value: option.value },
    } as React.ChangeEvent<HTMLSelectElement>;
    onChange(syntheticEvent);
    setSelectedOption(option);
    setIsOpen(false);
  };

  const hasIcons = options.some((opt) => opt.icon);

  if (!hasIcons) {
    return (
      <div>
        <label className="text-[13px] text-slate-800">{label}</label>

        <div className="input-box">
          <select
            value={value}
            onChange={onChange}
            className="w-full bg-transparent outline-none cursor-pointer text-sm text-black"
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
  }

  return (
    <div>
      <label className="text-[13px] text-slate-800">{label}</label>

      <div className="input-box relative" ref={dropdownRef}>
        <div
          onClick={() => setIsOpen(!isOpen)}
          className="w-full bg-transparent outline-none cursor-pointer text-sm text-black flex items-center gap-2 py-1"
        >
          {selectedOption?.icon && (
            <img
              src={selectedOption.icon}
              alt=""
              className="w-5 h-5 object-contain"
            />
          )}
          <span className="flex-1">
            {selectedOption?.label || placeholder || "Select..."}
          </span>
          <svg
            className={`w-4 h-4 transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>

        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
            {placeholder && (
              <div
                onClick={() => {
                  setIsOpen(false);
                }}
                className="px-3 py-2 text-sm text-gray-500 hover:bg-gray-100 cursor-pointer"
              >
                {placeholder}
              </div>
            )}
            {options.map((option) => (
              <div
                key={option.value}
                onClick={() => handleSelect(option)}
                className={`px-3 py-2 text-sm cursor-pointer flex items-center gap-2 hover:bg-gray-100 ${
                  option.value === value ? "bg-blue-50" : ""
                }`}
              >
                {option.icon && (
                  <img
                    src={option.icon}
                    alt=""
                    className="w-5 h-5 object-contain"
                  />
                )}
                <span>{option.label}</span>
              </div>
            ))}
          </div>
        )}

        <select
          value={value}
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

