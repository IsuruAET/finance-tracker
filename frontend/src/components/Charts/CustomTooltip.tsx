import React from "react";
import type { TooltipProps } from "recharts";
import { addThousandsSeparator } from "../../utils/helper";

// Define the shape of your pie chart data
interface PieData {
  name: string;
  value: number;
}

// Extend TooltipProps to include payload for your chart
interface CustomTooltipProps extends TooltipProps<number, string> {
  payload?: { payload: PieData }[];
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;

    return (
      <div className="bg-white shadow-md rounded-lg p-2 border border-gray-300">
        <p className="text-xs font-semibold text-purple-800 mb-1">
          {data.name}
        </p>
        <p className="text-sm text-gray-600">
          Amount:{" "}
          <span className="text-sm font-medium text-gray-900">
            AU${addThousandsSeparator(data.value)}
          </span>
        </p>
      </div>
    );
  }

  return null;
};

export default CustomTooltip;
