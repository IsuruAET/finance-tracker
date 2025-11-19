import { LuDownload } from "react-icons/lu";
import TransactionInfoCard from "../Cards/TransactionInfoCard";
import type { TransactionApiResponse } from "../../types/dashboard";

interface TransferListProps {
  transactions: TransactionApiResponse[];
  onDownload: () => void;
}

const TransferList = ({ transactions, onDownload }: TransferListProps) => {
  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <h5 className="text-lg">All Transfers</h5>

        <button className="card-btn" onClick={onDownload}>
          <LuDownload className="text-base" /> Download
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2">
        {transactions?.map((item) => (
          <TransactionInfoCard
            key={item._id}
            transaction={item}
            hideDeleteBtn={true}
          />
        ))}

        {(!transactions || transactions.length === 0) && (
          <div className="col-span-1 md:col-span-2 text-center py-8 bg-gray-50 rounded-lg">
            <p className="text-gray-500">No transfers found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransferList;
