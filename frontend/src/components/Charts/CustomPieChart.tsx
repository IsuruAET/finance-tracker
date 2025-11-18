import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

import type { TooltipProps, LegendProps } from "recharts";
import CustomTooltip from "./CustomTooltip";
import CustomLegend from "./CustomLegend";

export interface PieChartData {
  [key: string]: string | number;
  name: string;
  value: number;
}

interface CustomPieChartProps {
  data: PieChartData[];
  label: string;
  totalAmount: string | number;
  colors: string[];
  showTextAnchor?: boolean;
  legendOrder?: string[];
}

const CustomPieChart = ({
  data,
  label,
  totalAmount,
  colors,
  showTextAnchor = true,
  legendOrder,
}: CustomPieChartProps) => {
  return (
    <ResponsiveContainer width="100%" height={380}>
      <PieChart>
        <Pie
          data={data}
          nameKey="name"
          dataKey="value"
          cx="50%"
          cy="50%"
          outerRadius={130}
          innerRadius={100}
          labelLine={false}
        >
          {data.map((_, index) => (
            <Cell key={index} fill={colors[index % colors.length]} />
          ))}
        </Pie>

        {/* Use render function to satisfy TS */}
        <Tooltip
          content={(props: TooltipProps<number, string>) => (
            <CustomTooltip {...props} />
          )}
        />
        <Legend
          content={(props) => (
            <CustomLegend {...(props as LegendProps)} order={legendOrder} />
          )}
        />

        {showTextAnchor && (
          <>
            <text
              x="50%"
              y="50%"
              dy={-25}
              textAnchor="middle"
              fill="#666"
              fontSize={14}
            >
              {label}
            </text>
            <text
              x="50%"
              y="50%"
              dy={8}
              textAnchor="middle"
              fill="#333"
              fontSize={24}
              fontWeight={600}
            >
              {totalAmount}
            </text>
          </>
        )}
      </PieChart>
    </ResponsiveContainer>
  );
};

export default CustomPieChart;
