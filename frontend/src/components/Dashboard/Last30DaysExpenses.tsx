import { useEffect, useState } from "react";
import { prepareExpenseBarChartData } from "../../utils/helper";
import CustomBarChart, { type ChartDataItem } from "../Charts/CustomBarChart";
import type { TransactionApiResponse } from "../../types/dashboard";

const Last30DaysExpenses = ({
  Transactions,
  monthLabel,
}: {
  Transactions: TransactionApiResponse[];
  monthLabel?: string;
}) => {
  const [chartData, setChartData] = useState<ChartDataItem[]>([]);

  useEffect(() => {
    const result = prepareExpenseBarChartData(Transactions);
    setChartData(result);
  }, [Transactions]);

  const title = monthLabel
    ? `Highest Expense Categories – ${monthLabel}`
    : "Highest Expense Categories";

  return (
    <div className="card col-span-1">
      <div className="flex items-center justify-between">
        <h5 className="text-lg text-text-primary transition-colors">{title}</h5>
      </div>

      <div className="mt-6">
        {chartData.length === 0 ? (
          <div className="text-center py-12 bg-bg-secondary rounded-lg transition-colors">
            <p className="text-text-secondary transition-colors">
              No expense data available for this period
            </p>
          </div>
        ) : (
          <CustomBarChart data={chartData} />
        )}
      </div>
    </div>
  );
};

export default Last30DaysExpenses;
