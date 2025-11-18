import CustomPieChart from "../Charts/CustomPieChart";

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
    { name: "BF Balance", value: broadForwardBalance },
    { name: "Savings", value: savings },
    { name: "Income", value: income },
    { name: "Expenses", value: expenses },
    { name: "Total Balance", value: totalBalance },
  ];

  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <h5 className="text-lg">Finance Overview</h5>
      </div>

      <CustomPieChart
        data={balanceData}
        label="Total Balance"
        totalAmount={`AU$${totalBalance.toFixed(2)}`}
        colors={COLORS}
        showTextAnchor
        legendOrder={[
          "BF Balance",
          "Savings",
          "Income",
          "Expenses",
          "Total Balance",
        ]}
      />
    </div>
  );
};

export default FinanceOverview;
