import {
  LuUtensils,
  LuTrendingUp,
  LuTrendingDown,
  LuTrash2,
  LuWallet,
} from "react-icons/lu";
import { BiTransfer } from "react-icons/bi";
import type { TransactionApiResponse } from "../../types/dashboard";
import { formatDate, formatCurrency } from "../../utils/helper";

interface TransactionInfoCardProps {
  transaction: TransactionApiResponse;
  hideDeleteBtn?: boolean;
  onDelete?: () => void;
}

const TransactionInfoCard = ({
  transaction,
  hideDeleteBtn,
  onDelete,
}: TransactionInfoCardProps) => {
  const getTransactionTitleAndIcon = (item: TransactionApiResponse) => {
    if (item.type === "TRANSFER") {
      const fromWallet = item.fromWalletId?.name || "Wallet";
      const toWallet = item.toWalletId?.name || "Wallet";
      return {
        title: `${fromWallet} → ${toWallet}`,
        icon: undefined,
      };
    } else if (item.type === "EXPENSE") {
      return {
        title: item.categoryId?.name || item.desc || "",
        icon: item.categoryId?.icon,
      };
    } else if (item.type === "INITIAL_BALANCE") {
      return {
        title: item.walletId?.name || "New Savings",
        icon: undefined,
      };
    } else {
      return {
        title: item.categoryId?.name || item.desc || "",
        icon: item.categoryId?.icon,
      };
    }
  };

  const { title, icon } = getTransactionTitleAndIcon(transaction);
  const date = formatDate(transaction.date);
  const note = transaction.desc;
  const amount = transaction.amount;
  const type = transaction.type;

  const getAmountStyles = () => {
    if (type === "INCOME")
      return "bg-green-50 dark:bg-green-900/30 text-green-500 dark:text-green-400";
    if (type === "EXPENSE")
      return "bg-red-50 dark:bg-red-900/30 text-red-500 dark:text-red-400";
    if (type === "INITIAL_BALANCE")
      return "bg-orange-50 dark:bg-orange-900/30 text-orange-500 dark:text-orange-400";
    return "bg-blue-50 dark:bg-blue-900/30 text-blue-500 dark:text-blue-400";
  };

  return (
    <>
      <div className="group relative mt-3 p-4 pr-6 sm:pr-10 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-bg-secondary shadow-sm transition-all duration-200 hover:shadow-md hover:border-gray-200 dark:hover:border-gray-700 hover:-translate-y-0.5">
        {!hideDeleteBtn && onDelete && (
          <button
            className="absolute top-2.5 right-2.5 sm:top-3 sm:right-3 text-gray-400 dark:text-text-secondary hover:text-red-500 dark:hover:text-red-400 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 focus-visible:opacity-100 transition-all cursor-pointer z-10"
            onClick={onDelete}
            aria-label="Delete transaction"
          >
            <LuTrash2 size={18} />
          </button>
        )}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 flex items-center justify-center text-lg text-gray-800 dark:text-text-primary bg-gray-100 dark:bg-gray-700/60 dark:border dark:border-gray-600/50 rounded-full transition-colors shrink-0">
              {icon ? (
                <img src={icon} alt={title} className="w-6 h-6" />
              ) : type === "TRANSFER" ? (
                <BiTransfer className="w-6 h-6" />
              ) : type === "INITIAL_BALANCE" ? (
                <LuWallet className="w-6 h-6" />
              ) : (
                <LuUtensils />
              )}
            </div>

            <div className="flex-1">
              <p className="text-sm text-gray-900 dark:text-text-primary font-semibold transition-colors">
                {title}
              </p>
              <p className="text-xs text-gray-500 dark:text-text-secondary mt-1 transition-colors wrap-break-word">
                {date} {note ? `• ${note}` : ""}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end sm:flex-none sm:ml-auto">
            <div
              className={`flex items-center justify-center sm:justify-end gap-2 px-3 py-2 rounded-lg w-full sm:w-32 ${getAmountStyles()}`}
            >
              <h6 className="text-sm font-semibold tracking-tight text-center sm:text-right">
                {type === "INCOME" || type === "INITIAL_BALANCE"
                  ? "+"
                  : type === "EXPENSE"
                  ? "-"
                  : ""}
                {formatCurrency(amount)}
              </h6>
              {type === "INCOME" ? (
                <LuTrendingUp />
              ) : type === "EXPENSE" ? (
                <LuTrendingDown />
              ) : type === "INITIAL_BALANCE" ? (
                <LuTrendingUp />
              ) : (
                <BiTransfer />
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TransactionInfoCard;
