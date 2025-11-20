import { useState } from "react";
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
import Modal from "../Modal";
import DeleteAlert from "../DeleteAlert";

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

  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);

  const getAmountStyles = () => {
    if (type === "INCOME") return "bg-green-50 dark:bg-green-900/30 text-green-500 dark:text-green-400";
    if (type === "EXPENSE") return "bg-red-50 dark:bg-red-900/30 text-red-500 dark:text-red-400";
    if (type === "INITIAL_BALANCE") return "bg-orange-50 dark:bg-orange-900/30 text-orange-500 dark:text-orange-400";
    return "bg-blue-50 dark:bg-blue-900/30 text-blue-500 dark:text-blue-400";
  };

  return (
    <>
      <div className="group relative flex items-center gap-4 mt-2 p-3 rounded-lg hover:bg-gray-100/60 dark:hover:bg-hover transition-colors">
        <div className="w-12 h-12 flex items-center justify-center text-xl text-gray-800 dark:text-text-primary bg-gray-100 dark:bg-bg-secondary rounded-full transition-colors">
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

        <div className="flex-1 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-700 dark:text-text-primary font-medium transition-colors">{title}</p>
            <p className="text-xs text-gray-400 dark:text-text-secondary mt-1 transition-colors">
              {date} {note ? `• ${note}` : ""}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {!hideDeleteBtn && onDelete && (
              <button
                className="text-gray-400 dark:text-text-secondary hover:text-red-500 dark:hover:text-red-400 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 focus-visible:opacity-100 transition-all cursor-pointer"
                onClick={() => setIsDeleteAlertOpen(true)}
                aria-label="Delete transaction"
              >
                <LuTrash2 size={18} />
              </button>
            )}

            <div
              className={`flex items-center justify-between gap-2 px-3 py-1.5 rounded-md w-28 min-w-28 shrink-0 ${getAmountStyles()}`}
            >
              <h6 className="text-xs font-semibold tracking-tight text-right flex-1">
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

      {!hideDeleteBtn && onDelete && (
        <Modal
          isOpen={isDeleteAlertOpen}
          onClose={() => setIsDeleteAlertOpen(false)}
          title="Delete Transaction"
        >
          <DeleteAlert
            content="Are you sure you want to delete this transaction?"
            onDelete={() => {
              onDelete();
              setIsDeleteAlertOpen(false);
            }}
          />
        </Modal>
      )}
    </>
  );
};

export default TransactionInfoCard;
