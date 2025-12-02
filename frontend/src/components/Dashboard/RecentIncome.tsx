import { LuArrowRight } from "react-icons/lu";
import TransactionInfoCard from "../Cards/TransactionInfoCard";
import type { TransactionApiResponse } from "../../types/dashboard";

interface RecentTransactionsProps {
  transactions: TransactionApiResponse[] | undefined;
  onSeeMore: () => void;
}

const RecentIncome = ({ transactions, onSeeMore }: RecentTransactionsProps) => {
  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <h5 className="text-lg">Recent Income</h5>

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
              No income transactions found for this period
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentIncome;
