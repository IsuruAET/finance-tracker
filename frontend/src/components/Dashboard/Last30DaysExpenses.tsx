import { useEffect, useState } from "react";
import { prepareExpenseBarChartData } from "../../utils/helper";
import CustomBarChart, { type ChartDataItem } from "../Charts/CustomBarChart";
import type { TransactionApiResponse } from "../../types/dashboard";

const Last30DaysExpenses = ({
  Transactions,
}: {
  Transactions: TransactionApiResponse[];
}) => {
  const [chartData, setChartData] = useState<ChartDataItem[]>([]);

  useEffect(() => {
    const result = prepareExpenseBarChartData(Transactions);
    setChartData(result);
  }, [Transactions]);

  return (
    <div className="card col-span-1">
      <div className="flex items-center justify-between">
        <h5 className="text-lg">Last 30 Days Expenses</h5>
      </div>

      <CustomBarChart data={chartData} />
    </div>
  );
};

export default Last30DaysExpenses;
