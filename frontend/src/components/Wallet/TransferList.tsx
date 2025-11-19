import { LuDownload } from "react-icons/lu";
import TransactionInfoCard from "../Cards/TransactionInfoCard";
import type { TransactionApiResponse } from "../../types/dashboard";
import {
  groupTransactionsByDate,
  formatDateHeader,
} from "../../utils/helper";
import { DateTime } from "luxon";

interface TransferListProps {
  transactions: TransactionApiResponse[];
  onDownload: () => void;
}

const TransferList = ({ transactions, onDownload }: TransferListProps) => {
  const groupedTransactions = groupTransactionsByDate(transactions);

  // Sort dates in descending order (newest first)
  const sortedDates = Array.from(groupedTransactions.keys()).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  );

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <h5 className="text-lg font-semibold">All Transfers</h5>

        <button className="card-btn" onClick={onDownload}>
          <LuDownload className="text-base" /> Download
        </button>
      </div>

      {sortedDates.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No transfers found</p>
        </div>
      ) : (
        <div className="space-y-6">
          {sortedDates.map((dateKey) => {
            const dateTransactions = groupedTransactions.get(dateKey) || [];
            const dateHeader = formatDateHeader(dateKey);
            const fullDate = DateTime.fromISO(dateKey).toFormat("MMM d, yyyy");

            return (
              <div key={dateKey} className="space-y-3">
                <div className="flex items-center gap-3 pb-2 border-b border-gray-200">
                  <h6 className="text-sm font-semibold text-gray-700">
                    {dateHeader}
                  </h6>
                  {dateHeader !== fullDate && (
                    <span className="text-xs text-gray-400">{fullDate}</span>
                  )}
                  <span className="text-xs text-gray-400 ml-auto">
                    {dateTransactions.length}{" "}
                    {dateTransactions.length === 1
                      ? "transaction"
                      : "transactions"}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {dateTransactions.map((item) => (
                    <TransactionInfoCard
                      key={item._id}
                      transaction={item}
                      hideDeleteBtn={true}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TransferList;
