import EmojiPicker from "emoji-picker-react";
import type { EmojiClickData, Theme } from "emoji-picker-react";
import { useState } from "react";
import { LuImage, LuX } from "react-icons/lu";
import { useTheme } from "../../hooks/useTheme";

interface EmojiPickerPopupProps {
  icon?: string;
  onSelect: (iconUrl: string) => void;
}

const EmojiPickerPopup = ({ icon, onSelect }: EmojiPickerPopupProps) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const { theme } = useTheme();

  return (
    <div className="flex flex-col md:flex-row items-start gap-5 mb-6">
      <div
        className="flex items-center gap-4 cursor-pointer"
        onClick={() => setIsOpen(true)}
      >
        <div className="w-12 h-12 flex items-center justify-center text-2xl bg-purple-50 dark:bg-purple-900/20 text-primary rounded-lg transition-colors">
          {icon ? (
            <img src={icon} alt="Icon" className="w-12 h-12" />
          ) : (
            <LuImage />
          )}
        </div>

        <p className="text-text-primary transition-colors">
          {icon ? "Change Icon" : "Pick Icon"}
        </p>
      </div>

      {isOpen && (
        <div className="relative">
          <button
            className="w-7 h-7 flex items-center justify-center bg-bg-primary dark:bg-bg-secondary border border-border text-text-primary rounded-full absolute -top-2 -right-2 z-10 cursor-pointer hover:bg-hover transition-colors"
            onClick={() => setIsOpen(false)}
          >
            <LuX />
          </button>

          <EmojiPicker
            theme={(theme === "dark" ? "dark" : "light") as Theme}
            onEmojiClick={(emojiData: EmojiClickData) =>
              onSelect(emojiData?.imageUrl || "")
            }
          />
        </div>
      )}
    </div>
  );
};

export default EmojiPickerPopup;
