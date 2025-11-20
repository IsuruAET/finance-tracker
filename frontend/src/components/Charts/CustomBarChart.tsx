import { useEffect, useState } from "react";
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
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkViewport = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);

    checkViewport();
    window.addEventListener("resize", checkViewport);

    return () => window.removeEventListener("resize", checkViewport);
  }, []);

  // Function to alternate colors
  const getBarColor = (index: number): string => {
    return index % 2 === 0 ? "#875CF5" : "#CFBEFB";
  };

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
        <div className="bg-white shadow-md rounded-lg p-2 border border-gray-300">
          <p className="text-xs font-semibold text-purple-800 mb-1">{title}</p>
          {desc && <p className="text-xs text-gray-500 mb-1">{desc}</p>}
          <p className="text-sm text-gray-600">
            Amount:{" "}
            <span className="text-sm font-medium text-gray-900">
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
    <div className="bg-white mt-6">
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
              fill: "#555",
            }}
            angle={isMobile ? -40 : 0}
            textAnchor={isMobile ? "end" : "middle"}
            tickMargin={isMobile ? 8 : 16}
            stroke="none"
            tickFormatter={(value) => truncateLabel(value)}
          />
          <YAxis
            tick={{ fontSize: isMobile ? 10 : 12, fill: "#555" }}
            stroke="none"
            width={isMobile ? 40 : 60}
          />

          <Tooltip
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
