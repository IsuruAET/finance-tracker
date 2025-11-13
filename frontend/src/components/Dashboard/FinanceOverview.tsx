import CustomPieChart from "../Charts/CustomPieChart";

const COLORS = ["#875CF5", "#FF6900", "#FA2C37"];

interface FinanceOverviewProps {
  totalBalance: number;
  totalIncome: number;
  totalExpense: number;
}

const FinanceOverview: React.FC<FinanceOverviewProps> = ({
  totalBalance,
  totalIncome,
  totalExpense,
}) => {
  const balanceData = [
    { name: "Total Balance", value: totalBalance },
    { name: "Total Income", value: totalIncome },
    { name: "Total Expense", value: totalExpense },
  ];

  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <h5 className="text-lg">Finance Overview</h5>
      </div>

      <CustomPieChart
        data={balanceData}
        label="Total Balance"
        totalAmount={`AU$${totalBalance}`}
        colors={COLORS}
        showTextAnchor
      />
    </div>
  );
};

export default FinanceOverview;
