import React from "react";
import { formatDate } from "../../utils/helper";

interface InfoCardProps {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  color: string; // Tailwind color class, e.g. "bg-red-500"
  desc?: string; // Optional date/description text to display
}

const InfoCard = ({ icon, label, value, color, desc }: InfoCardProps) => {
  return (
    <div className="flex gap-6 bg-white p-6 rounded-2xl shadow-md shadow-gray-100 border border-gray-200/50">
      <div
        className={`w-14 h-14 flex items-center justify-center text-[26px] text-white ${color} rounded-full drop-shadow-xl`}
      >
        {icon}
      </div>
      <div className="flex-1">
        <h6 className="text-sm text-gray-500 mb-1">{label}</h6>
        {desc && (
          <p className="text-xs text-gray-400 mb-1">
            Created {formatDate(desc)}
          </p>
        )}
        <span className="text-[22px]">AU${value}</span>
      </div>
    </div>
  );
};

export default InfoCard;
