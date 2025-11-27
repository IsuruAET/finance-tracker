import { useMemo } from "react";
import CustomBarChart, { type ChartDataItem } from "../Charts/CustomBarChart";
import type { TransactionApiResponse } from "../../types/dashboard";
import {
  filterTransactionsByDateRange,
  prepareTransactionBarChartData,
} from "../../utils/helper";
import { useDateRange } from "../../context/DateRangeContext";

interface TransactionOverviewProps {
  transactions: TransactionApiResponse[];
}

const TransactionOverview = ({ transactions }: TransactionOverviewProps) => {
  const { dateRange } = useDateRange();
  const { startDate, endDate } = dateRange;

  const filteredTransactions = useMemo(
    () => filterTransactionsByDateRange(transactions, startDate, endDate),
    [transactions, startDate, endDate]
  );

  const chartData = useMemo<ChartDataItem[]>(
    () => prepareTransactionBarChartData(filteredTransactions),
    [filteredTransactions]
  );

  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <div>
          <h5 className="text-lg">Transaction Overview</h5>
          <p className="text-xs text-gray-400 mt-0.5">
            Monitor net inflows and outflows across your selected date range.
          </p>
        </div>
      </div>

      <div className="mt-10">
        {chartData.length === 0 ? (
          <div className="text-center py-12 bg-bg-secondary rounded-lg transition-colors">
            <p className="text-text-secondary transition-colors">
              No transactions found
            </p>
          </div>
        ) : (
          <CustomBarChart data={chartData} />
        )}
      </div>
    </div>
  );
};

export default TransactionOverview;
