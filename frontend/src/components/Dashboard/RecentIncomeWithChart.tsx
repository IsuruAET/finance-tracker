import { useCallback, useEffect, useState } from "react";
import CustomPieChart from "../Charts/CustomPieChart";
import type { Transaction } from "../../types/dashboard";
import type { PieChartData } from "../Charts/CustomPieChart";

interface RecentIncomeWithChartProps {
  data: Transaction[];
  totalIncome: number;
}

const RecentIncomeWithChart = ({
  data,
  totalIncome,
}: RecentIncomeWithChartProps) => {
  const COLORS = ["#875CF5", "#FA2C37", "#FF6900", "#4F39F6"];

  // Explicitly type the state
  const [chartData, setChartData] = useState<PieChartData[]>([]);

  const prepareChartData = useCallback(() => {
    const dataArr: PieChartData[] =
      data?.map((item) => ({
        name: item?.source || "Unknown",
        value: item?.amount,
      })) || [];

    setChartData(dataArr);
  }, [data]);

  useEffect(() => {
    prepareChartData();
  }, [prepareChartData]);

  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <h5 className="text-lg">Last 60 Days Income</h5>
      </div>

      <CustomPieChart
        data={chartData}
        label="Total Income"
        totalAmount={`AU$${totalIncome}`}
        colors={COLORS}
        showTextAnchor
      />
    </div>
  );
};

export default RecentIncomeWithChart;
