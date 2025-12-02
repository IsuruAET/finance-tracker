import { LuArrowRight } from "react-icons/lu";
import TransactionInfoCard from "../Cards/TransactionInfoCard";
import type React from "react";
import type { TransactionApiResponse } from "../../types/dashboard";

interface ExpenseTransactionsProps {
  transactions: TransactionApiResponse[];
  onSeeMore: () => void;
}

const ExpenseTransactions: React.FC<ExpenseTransactionsProps> = ({
  transactions,
  onSeeMore,
}) => {
  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <h5 className="text-lg">Recent Expenses</h5>

        <button className="card-btn" onClick={onSeeMore}>
          See All <LuArrowRight className="text-base" />
        </button>
      </div>

      <div className="mt-6">
        {transactions && transactions.length > 0 ? (
          transactions.slice(0, 5).map((item) => (
            <TransactionInfoCard
              key={item._id}
              transaction={item}
              hideDeleteBtn
            />
          ))
        ) : (
          <div className="text-center py-8 bg-bg-secondary rounded-lg transition-colors">
            <p className="text-text-secondary transition-colors">
              No expense transactions found for this period
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExpenseTransactions;
