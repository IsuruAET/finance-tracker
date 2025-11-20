import { useState, useRef, useEffect } from "react";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa6";

interface InputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  label?: string;
  type?: string;
}

const Input: React.FC<InputProps> = ({
  value,
  onChange,
  placeholder,
  label,
  type = "text",
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const isPassword = type === "password";
  const isNumber = type === "number";

  useEffect(() => {
    if (!isNumber) return;

    const input = inputRef.current;
    if (!input) return;

    const handleWheel = (e: WheelEvent) => {
      if (document.activeElement === input) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    input.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      input.removeEventListener("wheel", handleWheel);
    };
  }, [isNumber]);

  const handleWheel = (event: React.WheelEvent<HTMLInputElement>) => {
    if (isNumber) {
      event.preventDefault();
      event.stopPropagation();
    }
  };

  const handleNumberKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === "ArrowUp" || event.key === "ArrowDown") {
      event.preventDefault();
    }
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div>
      {label && (
        <label className="text-[13px] text-text-secondary transition-colors mb-1 block">
          {label}
        </label>
      )}

      <div className="w-full bg-bg-primary dark:bg-bg-secondary border border-border rounded-lg px-4 py-3 mb-4 mt-3 flex items-center gap-2 text-sm text-text-primary transition-colors hover:border-purple-500/50">
        <input
          ref={inputRef}
          type={isPassword ? (showPassword ? "text" : "password") : type}
          placeholder={placeholder}
          className={`w-full bg-transparent outline-none text-text-primary placeholder:text-text-secondary transition-colors ${
            isNumber
              ? "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              : ""
          }`}
          value={value}
          onChange={(e) => onChange(e)}
          onWheel={isNumber ? handleWheel : undefined}
          onKeyDown={isNumber ? handleNumberKeyDown : undefined}
        />

        {isPassword && (
          <>
            {showPassword ? (
              <FaRegEye
                size={22}
                className="text-primary cursor-pointer shrink-0"
                onClick={() => toggleShowPassword()}
              />
            ) : (
              <FaRegEyeSlash
                size={22}
                className="text-text-secondary cursor-pointer transition-colors shrink-0"
                onClick={() => toggleShowPassword()}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Input;
