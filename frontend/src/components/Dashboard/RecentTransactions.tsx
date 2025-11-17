import { LuArrowRight } from "react-icons/lu";
import TransactionInfoCard from "../Cards/TransactionInfoCard";
import type { Transaction } from "../../types/dashboard";
import { formatDate } from "../../utils/helper";

interface RecentTransactionsProps {
  transactions: Transaction[] | undefined;
  onSeeMore: () => void;
}

const getTransactionTitleAndIcon = (item: Transaction) => {
  if (item.type === "transfer") {
    const fromWallet =
      typeof item.fromWalletId === "object"
        ? item.fromWalletId?.name
        : "Wallet";
    const toWallet =
      typeof item.toWalletId === "object" ? item.toWalletId?.name : "Wallet";
    return {
      title: `From ${fromWallet} to ${toWallet}`,
      icon:
        typeof item.fromWalletId === "object"
          ? item.fromWalletId?.icon
          : undefined,
    };
  } else if (item.type === "expense") {
    return {
      title: item.category,
      icon: item.icon,
    };
  } else {
    return {
      title: item.source,
      icon: item.icon,
    };
  }
};

const RecentTransactions = ({
  transactions,
  onSeeMore,
}: RecentTransactionsProps) => {
  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <h5 className="text-lg">Recent Transactions</h5>

        <button className="card-btn" onClick={onSeeMore}>
          See All <LuArrowRight className="text-base" />
        </button>
      </div>

      <div className="mt-6">
        {transactions?.slice(0, 5).map((item) => {
          const { title, icon } = getTransactionTitleAndIcon(item);

          return (
            <TransactionInfoCard
              key={item._id}
              title={title}
              icon={icon}
              date={formatDate(item.date)}
              amount={item.amount}
              type={item.type}
              hideDeleteBtn
            />
          );
        })}
      </div>
    </div>
  );
};

export default RecentTransactions;
