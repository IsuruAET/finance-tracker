import {
  LuUtensils,
  LuTrendingUp,
  LuTrendingDown,
  LuTrash2,
  LuWallet,
} from "react-icons/lu";
import { BiTransfer } from "react-icons/bi";
import type { TransactionApiResponse } from "../../types/dashboard";
import { formatDate, addThousandsSeparator } from "../../utils/helper";

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
    if (type === "INCOME") return "bg-green-50 text-green-500";
    if (type === "EXPENSE") return "bg-red-50 text-red-500";
    if (type === "INITIAL_BALANCE") return "bg-orange-50 text-orange-500";
    return "bg-blue-50 text-blue-500";
  };

  return (
    <div className="group relative flex items-center gap-4 mt-2 p-3 rounded-lg hover:bg-gray-100/60">
      <div className="w-12 h-12 flex items-center justify-center text-xl text-gray-800 bg-gray-100 rounded-full">
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
          <p className="text-sm text-gray-700 font-medium">{title}</p>
          <p className="text-xs text-gray-400 mt-1">
            {date} {note ? `• ${note}` : ""}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {!hideDeleteBtn && (
            <button
              className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              onClick={onDelete}
            >
              <LuTrash2 size={18} />
            </button>
          )}

          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md ${getAmountStyles()}`}
          >
            <h6 className="text-xs font-medium">
              {type === "INCOME" || type === "INITIAL_BALANCE"
                ? "+"
                : type === "EXPENSE"
                ? "-"
                : ""}{" "}
              AU${addThousandsSeparator(amount)}
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
  );
};

export default TransactionInfoCard;
