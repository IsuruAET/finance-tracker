import React, { useState, useRef, useEffect } from "react";
import { IoIosArrowDown } from "react-icons/io";

interface AutoCompleteOption {
  value: string;
  label: string;
  icon?: string;
}

interface AutoCompleteProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  placeholder?: string;
  label?: string;
  options: AutoCompleteOption[];
  required?: boolean;
}

const AutoComplete: React.FC<AutoCompleteProps> = ({
  value,
  onChange,
  placeholder,
  label,
  options,
  required = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOption, setSelectedOption] =
    useState<AutoCompleteOption | null>(
      options.find((opt) => opt.value === value) || null
    );
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const option = options.find((opt) => opt.value === value);
    setSelectedOption(option || null);
    if (option) {
      setSearchTerm(option.label);
    } else {
      setSearchTerm("");
    }
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

  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (option: AutoCompleteOption) => {
    const syntheticEvent = {
      target: { value: option.value },
    } as React.ChangeEvent<HTMLSelectElement>;
    onChange(syntheticEvent);
    setSelectedOption(option);
    setSearchTerm(option.label);
    setIsOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setIsOpen(true);
    // Clear selection if input doesn't match selected option
    if (selectedOption && e.target.value !== selectedOption.label) {
      const syntheticEvent = {
        target: { value: "" },
      } as React.ChangeEvent<HTMLSelectElement>;
      onChange(syntheticEvent);
      setSelectedOption(null);
    }
  };

  const handleInputFocus = () => {
    setIsOpen(true);
  };

  const handleContainerClick = () => {
    if (!isOpen) {
      setIsOpen(true);
      inputRef.current?.focus();
    }
  };

  const hasIcons = options.some((opt) => opt.icon);

  return (
    <div>
      {label && (
        <label className="text-[13px] text-text-secondary transition-colors mb-1 block">
          {label}
        </label>
      )}

      <div className="relative mb-4 mt-3" ref={dropdownRef}>
        <div
          className="w-full bg-bg-primary dark:bg-bg-secondary border border-border rounded-lg px-4 py-3 flex items-center gap-2 text-sm text-text-primary cursor-pointer transition-colors hover:border-purple-500/50"
          onClick={handleContainerClick}
        >
          {selectedOption?.icon && hasIcons && (
            <img
              src={selectedOption.icon}
              alt=""
              className="w-5 h-5 object-contain shrink-0"
            />
          )}
          <input
            ref={inputRef}
            type="text"
            value={searchTerm}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            placeholder={placeholder || "Type to search..."}
            className="w-full bg-transparent outline-none flex-1 text-base text-text-primary placeholder:text-text-secondary transition-colors"
            required={required}
          />
          <IoIosArrowDown
            className={`w-4 h-4 text-text-secondary transition-transform duration-200 shrink-0 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </div>

        {isOpen && filteredOptions.length > 0 && (
          <div className="absolute z-50 w-full mt-1 bg-bg-primary dark:bg-bg-secondary border border-border rounded-lg shadow-lg dark:shadow-black/50 max-h-60 overflow-auto">
            {filteredOptions.map((option) => (
              <div
                key={option.value}
                onClick={() => handleSelect(option)}
                className={`px-4 py-2 text-sm cursor-pointer flex items-center gap-2 hover:bg-hover transition-colors ${
                  option.value === value
                    ? "bg-purple-50 dark:bg-purple-900/20"
                    : ""
                }`}
              >
                {option.icon && (
                  <img
                    src={option.icon}
                    alt=""
                    className="w-5 h-5 object-contain"
                  />
                )}
                <span className="text-text-primary">{option.label}</span>
              </div>
            ))}
          </div>
        )}

        {isOpen && searchTerm && filteredOptions.length === 0 && (
          <div className="absolute z-50 w-full mt-1 bg-bg-primary dark:bg-bg-secondary border border-border rounded-lg shadow-lg dark:shadow-black/50">
            <div className="px-4 py-2 text-sm text-text-secondary">
              No categories found
            </div>
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

export default AutoComplete;
