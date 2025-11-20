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
import { formatCurrency } from "../../utils/helper";
import { useTheme } from "../../hooks/useTheme";

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
  const { theme } = useTheme();
  const tickColor = theme === "dark" ? "#b0b3b8" : "#555";
  
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
        <div className="bg-bg-primary dark:bg-bg-secondary shadow-md rounded-lg p-2 border border-border transition-colors">
          <p className="text-xs font-semibold text-purple-800 dark:text-purple-400 mb-1 transition-colors">{title}</p>
          <p className="text-sm text-text-secondary transition-colors">
            Amount:{" "}
            <span className="text-sm font-medium text-text-primary transition-colors">
              {formatCurrency(yAxisValue)}
            </span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-transparent mt-6">
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
            tick={{ fontSize: 12, fill: tickColor }}
            stroke="none"
          />
          <YAxis tick={{ fontSize: 12, fill: tickColor }} stroke="none" />

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
