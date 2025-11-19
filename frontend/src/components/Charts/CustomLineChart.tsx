import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import type { TooltipProps } from "recharts";
import { addThousandsSeparator } from "../../utils/helper";

// Define data type
export interface ChartDataItem {
  title: string;
  yAxisValue: number;
  xAxisValue: string;
}

interface CustomLineChartProps {
  data: ChartDataItem[];
}

const CustomLineChart = ({ data }: CustomLineChartProps) => {
  // Define your data type
  interface LineData {
    title: string;
    yAxisValue: number;
  }

  // Type the props manually
  interface CustomTooltipProps extends TooltipProps<number, string> {
    payload?: readonly {
      payload: LineData;
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
              AU${addThousandsSeparator(yAxisValue)}
            </span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white mt-6">
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#875CF5" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#875CF5" stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid stroke="none" />

          <XAxis
            dataKey="xAxisValue"
            tick={{ fontSize: 12, fill: "#555" }}
            stroke="none"
          />
          <YAxis tick={{ fontSize: 12, fill: "#555" }} stroke="none" />

          <Tooltip
            content={(props: TooltipProps<number, string>) => (
              <CustomTooltip {...props} />
            )}
          />

          <Area
            type="monotone"
            dataKey="yAxisValue"
            stroke="#875CF5"
            fill="url(#expenseGradient)"
            strokeWidth={3}
            dot={{ r: 3, fill: "#AB8DF8" }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CustomLineChart;
