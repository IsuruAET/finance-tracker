import { useCallback, useEffect, useMemo, useState } from "react";
import CustomLineChart, { type ChartDataItem } from "../Charts/CustomLineChart";
import type { ClosingBalanceHistoryItem } from "../../types/dashboard";
import { formatCurrency } from "../../utils/helper";

interface ClosingBalanceTrendsProps {
  closingBalanceHistory: ClosingBalanceHistoryItem[];
}

const ClosingBalanceTrends = ({
  closingBalanceHistory,
}: ClosingBalanceTrendsProps) => {
  const [chartData, setChartData] = useState<ChartDataItem[]>([]);

  const latestBalance = useMemo(
    () =>
      closingBalanceHistory?.[closingBalanceHistory.length - 1]?.balance || 0,
    [closingBalanceHistory]
  );

  const prepareChartData = useCallback(() => {
    if (!closingBalanceHistory?.length) {
      setChartData([]);
      return;
    }

    const formatted: ChartDataItem[] = closingBalanceHistory.map((item) => ({
      title: `${item.monthLabel} Closing Balance`,
      xAxisValue: item.monthLabel,
      yAxisValue: item.balance,
    }));

    setChartData(formatted);
  }, [closingBalanceHistory]);

  useEffect(() => {
    prepareChartData();
  }, [prepareChartData]);

  return (
    <div className="card">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h5 className="text-lg">Closing Balance Trend</h5>
          <p className="text-sm text-gray-500">Last 5 months + current month</p>
        </div>
        <div className="text-right">
          <p className="text-xs uppercase tracking-wide text-gray-500">
            Current Balance
          </p>
          <p className="text-xl font-semibold text-primary">
            {formatCurrency(latestBalance)}
          </p>
        </div>
      </div>
      <CustomLineChart data={chartData} />
    </div>
  );
};

export default ClosingBalanceTrends;
