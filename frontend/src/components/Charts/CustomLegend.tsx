import React from "react";
import type { LegendProps, LegendPayload } from "recharts";

interface CustomLegendProps extends Omit<LegendProps, "payload" | "order"> {
  payload?: LegendPayload[];
  order?: string[];
}

const CustomLegend: React.FC<CustomLegendProps> = ({ payload, order }) => {
  if (!payload) return null;

  // Sort payload based on order array if provided
  const sortedPayload = order
    ? [...payload].sort((a, b) => {
        const indexA = order.indexOf(a.value as string);
        const indexB = order.indexOf(b.value as string);
        // If not found in order, keep original position
        if (indexA === -1) return 1;
        if (indexB === -1) return -1;
        return indexA - indexB;
      })
    : payload;

  return (
    <div className="flex flex-wrap justify-center gap-2 mt-4">
      {sortedPayload.map((entry, index) => (
        <div key={index} className="flex items-center space-x-2">
          <div
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-xs text-gray-700 dark:text-text-primary font-medium transition-colors">
            {entry.value}
          </span>
        </div>
      ))}
    </div>
  );
};

export default CustomLegend;
