import {
  LuUtensils,
  LuTrendingUp,
  LuTrendingDown,
  LuTrash2,
} from "react-icons/lu";
import { BiTransfer } from "react-icons/bi";
import type { Transaction } from "../../types/dashboard";
import { formatDate } from "../../utils/helper";

interface TransactionInfoCardProps {
  transaction?: Transaction;
  type?: "income" | "expense" | "transfer";
  hideDeleteBtn?: boolean;
  onDelete?: () => void;
}

const TransactionInfoCard = ({
  transaction,
  type: typeProp,
  hideDeleteBtn,
  onDelete,
}: TransactionInfoCardProps) => {
  const getTransactionTitleAndIcon = (item: Transaction) => {
    if (item.type === "transfer") {
      const fromWallet =
        typeof item.fromWalletId === "object"
          ? item.fromWalletId?.name
          : "Wallet";
      const toWallet =
        typeof item.toWalletId === "object" ? item.toWalletId?.name : "Wallet";
      return {
        title: `${fromWallet} → ${toWallet}`,
        icon: undefined,
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

  if (!transaction && !typeProp) return null;

  const { title, icon } = transaction
    ? getTransactionTitleAndIcon(transaction)
    : { title: "", icon: undefined };
  const date = transaction ? formatDate(transaction.date) : "";
  const note = transaction?.note;
  const amount = transaction?.amount ?? 0;
  const type = typeProp ?? transaction?.type;

  const getAmountStyles = () => {
    if (type === "income") return "bg-green-50 text-green-500";
    if (type === "expense") return "bg-red-50 text-red-500";
    return "bg-blue-50 text-blue-500";
  };

  return (
    <div className="group relative flex items-center gap-4 mt-2 p-3 rounded-lg hover:bg-gray-100/60">
      <div className="w-12 h-12 flex items-center justify-center text-xl text-gray-800 bg-gray-100 rounded-full">
        {icon ? (
          <img src={icon} alt={title} className="w-6 h-6" />
        ) : type === "transfer" ? (
          <BiTransfer className="w-6 h-6" />
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
              {type === "income" ? "+" : type === "expense" ? "-" : ""} AU$
              {amount}
            </h6>
            {type === "income" ? (
              <LuTrendingUp />
            ) : type === "expense" ? (
              <LuTrendingDown />
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
