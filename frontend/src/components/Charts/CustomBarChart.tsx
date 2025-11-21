import { useEffect, useMemo, useState } from "react";
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
import { formatCurrency } from "../../utils/helper";
import { useTheme } from "../../hooks/useTheme";

// Define data type
export interface ChartDataItem {
  title: string;
  yAxisValue: number;
  xAxisValue: string;
  desc?: string;
}

interface CustomBarChartProps {
  data: ChartDataItem[];
}

const MOBILE_BREAKPOINT = 640;

const CustomBarChart = ({ data }: CustomBarChartProps) => {
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

  // Function to alternate colors
  const getBarColor = (index: number): string => {
    return index % 2 === 0 ? "#875CF5" : "#CFBEFB";
  };

  const tooltipCursorProps = useMemo(() => {
    const fill =
      theme === "dark" ? "rgba(58, 59, 60, 0.35)" : "rgba(243, 244, 246, 0.65)";
    const stroke = theme === "dark" ? "#4a4b4d" : "#e4e6eb";
    return {
      fill,
      stroke,
      strokeWidth: 1,
      radius: 12,
    };
  }, [theme]);

  // Define your data type
  interface BarData {
    title: string;
    yAxisValue: number;
    desc?: string;
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
      const { title, yAxisValue, desc } = payload[0].payload;
      return (
        <div className="bg-bg-primary dark:bg-bg-secondary shadow-md rounded-lg p-2 border border-border transition-colors">
          <p className="text-xs font-semibold text-purple-800 dark:text-purple-400 mb-1 transition-colors">
            {title}
          </p>
          {desc && (
            <p className="text-xs text-text-secondary mb-1 transition-colors">
              {desc}
            </p>
          )}
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

  // Truncate long labels for x-axis
  const truncateLabel = (label: string, maxLength: number = 12): string => {
    if (label.length <= maxLength) return label;
    return label.substring(0, maxLength) + "...";
  };

  return (
    <div className="bg-transparent mt-6">
      <ResponsiveContainer width="100%" height={isMobile ? 240 : 300}>
        <BarChart
          data={data}
          barCategoryGap={isMobile ? "25%" : "15%"}
          margin={{ top: 10, right: 6, left: 0, bottom: isMobile ? 36 : 10 }}
        >
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
            width={isMobile ? 40 : 60}
          />

          <Tooltip
            cursor={tooltipCursorProps}
            content={(props: TooltipProps<number, string>) => (
              <CustomTooltip {...props} />
            )}
          />

          <Bar
            dataKey="yAxisValue"
            fill="#FF8042"
            radius={[10, 10, 0, 0]}
            maxBarSize={isMobile ? 32 : undefined}
          >
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
