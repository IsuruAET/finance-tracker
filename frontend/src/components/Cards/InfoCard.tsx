import { FiExternalLink } from "react-icons/fi";
import { formatCurrency } from "../../utils/helper";

interface InfoCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string; // Tailwind color class, e.g. "bg-red-500"
  desc?: string; // Optional date/description text to display
  onNavigate?: () => void;
}

const InfoCard = ({
  icon,
  label,
  value,
  color,
  desc,
  onNavigate,
}: InfoCardProps) => {
  return (
    <div className="bg-bg-primary p-6 rounded-2xl shadow-md shadow-gray-100 dark:shadow-black/20 border border-border transition-colors">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4 sm:gap-6 min-w-0">
          <div
            className={`w-14 h-14 flex items-center justify-center text-[26px] text-white ${color} rounded-full drop-shadow-xl`}
          >
            {icon}
          </div>
          <div>
            <h6 className="text-sm text-text-secondary mb-1 transition-colors">
              {label}
            </h6>
            {desc && (
              <p className="text-xs text-text-secondary mb-1 transition-colors">
                {desc}
              </p>
            )}
            <span className="text-[22px] text-text-primary transition-colors">
              {formatCurrency(value)}
            </span>
          </div>
        </div>
        {onNavigate && (
          <button
            type="button"
            onClick={onNavigate}
            className="md:hidden flex h-12 w-12 items-center justify-center rounded-full border border-border text-primary shadow-sm transition-all hover:bg-primary/10 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg-primary active:scale-[0.98]"
            aria-label={`Go to ${label}`}
          >
            <FiExternalLink
              className="text-[28px] font-semibold"
              strokeWidth={2.5}
            />
          </button>
        )}
      </div>
    </div>
  );
};

export default InfoCard;
