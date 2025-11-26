import { useEffect, useState } from "react";
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

const MOBILE_BREAKPOINT = 640;

const CustomLineChart = ({ data }: CustomLineChartProps) => {
  const { theme } = useTheme();
  const tickColor = theme === "dark" ? "#b0b3b8" : "#555";
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkViewport = () =>
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);

    checkViewport();
    window.addEventListener("resize", checkViewport);

    return () => window.removeEventListener("resize", checkViewport);
  }, []);

  // Define your data type
  interface LineData {
    title: string;
    xAxisValue: string;
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
      const { xAxisValue, yAxisValue } = payload[0].payload;
      return (
        <div className="bg-bg-primary dark:bg-bg-secondary shadow-md rounded-lg p-2 border border-border transition-colors">
          <p className="text-xs font-semibold text-purple-800 dark:text-purple-400 mb-1 transition-colors">
            {xAxisValue}
          </p>
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

  const truncateLabel = (label: string, maxLength: number = 12): string => {
    if (label.length <= maxLength) return label;
    return label.substring(0, maxLength) + "...";
  };

  return (
    <div className="bg-transparent mt-6">
      <ResponsiveContainer width="100%" height={isMobile ? 240 : 300}>
        <AreaChart
          data={data}
          margin={{ top: 10, right: 6, left: 0, bottom: isMobile ? 36 : 10 }}
        >
          <defs>
            <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#875CF5" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#875CF5" stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid stroke="none" />

          <XAxis
            dataKey="xAxisValue"
            interval={0}
            height={isMobile ? 60 : undefined}
            tick={{
              fontSize: isMobile ? 10 : 12,
              fill: tickColor,
            }}
            angle={isMobile ? -40 : 0}
            textAnchor={isMobile ? "end" : "middle"}
            tickMargin={isMobile ? 8 : 16}
            stroke="none"
            tickFormatter={(value) => truncateLabel(value)}
          />
          <YAxis
            tick={{ fontSize: isMobile ? 10 : 12, fill: tickColor }}
            stroke="none"
          />

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
