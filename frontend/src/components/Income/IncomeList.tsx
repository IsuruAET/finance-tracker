import { LuDownload } from "react-icons/lu";
import TransactionInfoCard from "../Cards/TransactionInfoCard";
import { formatDate } from "../../utils/helper";
import type { Transaction } from "../../types/dashboard";

interface IncomeListProps {
  transactions: Transaction[];
  onDelete: (id: string) => void;
  onDownload: () => void;
}

const IncomeList = ({
  transactions,
  onDelete,
  onDownload,
}: IncomeListProps) => {
  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <h5 className="text-lg">Income Sources</h5>

        <button className="card-btn" onClick={onDownload}>
          <LuDownload className="text-base" /> Download
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2">
        {transactions?.map((item) => (
          <TransactionInfoCard
            key={item._id}
            title={item.source}
            icon={item.icon}
            date={formatDate(item.date)}
            amount={item.amount}
            type="income"
            onDelete={() => onDelete(item._id)}
          />
        ))}
      </div>
    </div>
  );
};

export default IncomeList;
