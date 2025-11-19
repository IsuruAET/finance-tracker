import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import type { TooltipProps } from "recharts";

// Define data type
export interface ChartDataItem {
  title: string;
  yAxisValue: number;
  xAxisValue: string;
}

interface CustomBarChartProps {
  data: ChartDataItem[];
}

const CustomBarChart = ({ data }: CustomBarChartProps) => {
  // Function to alternate colors
  const getBarColor = (index: number): string => {
    return index % 2 === 0 ? "#875CF5" : "#CFBEFB";
  };

  // Define your data type
  interface BarData {
    title: string;
    yAxisValue: number;
  }

  // Type the props manually
  interface CustomTooltipProps extends TooltipProps<number, string> {
    payload?: readonly {
      payload: BarData;
      name?: string;
      value?: number;
    }[];
  }

  const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
      const { title, yAxisValue } = payload[0].payload;
      return (
        <div className="bg-white shadow-md rounded-lg p-2 border border-gray-300">
          <p className="text-xs font-semibold text-purple-800 mb-1">{title}</p>
          <p className="text-sm text-gray-600">
            Amount:{" "}
            <span className="text-sm font-medium text-gray-900">
              AU${yAxisValue}
            </span>
          </p>
        </div>
      );
    }
    return null;
  };

  // Truncate long labels for x-axis
  const truncateLabel = (label: string, maxLength: number = 12): string => {
    if (label.length <= maxLength) return label;
    return label.substring(0, maxLength) + "...";
  };

  return (
    <div className="bg-white mt-6">
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid stroke="none" />

          <XAxis
            dataKey="xAxisValue"
            tick={{ fontSize: 12, fill: "#555" }}
            stroke="none"
            tickFormatter={(value) => truncateLabel(value)}
          />
          <YAxis tick={{ fontSize: 12, fill: "#555" }} stroke="none" />

          <Tooltip
            content={(props: TooltipProps<number, string>) => (
              <CustomTooltip {...props} />
            )}
          />

          <Bar dataKey="yAxisValue" fill="#FF8042" radius={[10, 10, 0, 0]}>
            {data.map((_entry, index) => (
              <Cell key={index} fill={getBarColor(index)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CustomBarChart;
