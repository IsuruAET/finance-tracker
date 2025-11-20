import { formatCurrency } from "../../utils/helper";

interface InfoCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string; // Tailwind color class, e.g. "bg-red-500"
  desc?: string; // Optional date/description text to display
}

const InfoCard = ({ icon, label, value, color, desc }: InfoCardProps) => {
  return (
    <div className="flex gap-6 bg-bg-primary p-6 rounded-2xl shadow-md shadow-gray-100 dark:shadow-black/20 border border-border transition-colors">
      <div
        className={`w-14 h-14 flex items-center justify-center text-[26px] text-white ${color} rounded-full drop-shadow-xl`}
      >
        {icon}
      </div>
      <div className="flex-1">
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
  );
};

export default InfoCard;
