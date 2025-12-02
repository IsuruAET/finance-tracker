import CustomPieChart from "../Charts/CustomPieChart";
import { formatCurrency } from "../../utils/helper";

// Tailwind CSS color values matching data order: BF Balance, Savings, Income, Expenses, Total Balance
const COLORS = [
  "#3b82f6", // blue-500 - BF Balance
  "#f97316", // orange-500 - Savings
  "#22c55e", // green-500 - Income
  "#ef4444", // red-500 - Expenses
  "#a855f7", // purple-500 - Total Balance
];

interface FinanceOverviewProps {
  broadForwardBalance: number;
  savings: number;
  income: number;
  expenses: number;
  totalBalance: number;
}

const FinanceOverview: React.FC<FinanceOverviewProps> = ({
  broadForwardBalance,
  savings,
  income,
  expenses,
  totalBalance,
}) => {
  const balanceData = [
    { name: "Opening Balance", value: broadForwardBalance },
    ...(savings ? [{ name: "External Deposit", value: savings }] : []),
    { name: "Income", value: income },
    { name: "Expenses", value: expenses },
    { name: "Total Balance", value: totalBalance },
  ];

  const legendOrder = [
    "Opening Balance",
    ...(savings ? ["External Deposit"] : []),
    "Income",
    "Expenses",
    "Total Balance",
  ];

  const colors = [
    COLORS[0], // Opening Balance
    ...(savings ? [COLORS[1]] : []), // External Deposit
    COLORS[2], // Income
    COLORS[3], // Expenses
    COLORS[4], // Total Balance
  ];

  const hasData =
    broadForwardBalance !== 0 ||
    savings !== 0 ||
    income !== 0 ||
    expenses !== 0 ||
    totalBalance !== 0;

  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <h5 className="text-lg text-text-primary transition-colors">Finance Overview</h5>
      </div>

      <div className="mt-8">
        {hasData ? (
          <CustomPieChart
            data={balanceData}
            label="Total Balance"
            totalAmount={formatCurrency(totalBalance)}
            colors={colors}
            showTextAnchor
            legendOrder={legendOrder}
          />
        ) : (
          <div className="text-center py-12 bg-bg-secondary rounded-lg transition-colors">
            <p className="text-text-secondary transition-colors">
              No financial data available for this period
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FinanceOverview;
