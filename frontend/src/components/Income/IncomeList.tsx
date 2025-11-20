import { LuDownload } from "react-icons/lu";
import TransactionInfoCard from "../Cards/TransactionInfoCard";
import type { TransactionApiResponse } from "../../types/dashboard";
import { groupTransactionsByDate, formatDateHeader } from "../../utils/helper";
import { DateTime } from "luxon";

interface IncomeListProps {
  transactions: TransactionApiResponse[];
  onDelete: (id: string) => void;
  onDownload: () => void;
}

const IncomeList = ({
  transactions,
  onDelete,
  onDownload,
}: IncomeListProps) => {
  const groupedTransactions = groupTransactionsByDate(transactions);

  // Sort dates in descending order (newest first)
  const sortedDates = Array.from(groupedTransactions.keys()).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  );

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <h5 className="text-lg font-semibold">Income Sources</h5>

        <button className="card-btn" onClick={onDownload}>
          <LuDownload className="text-base" /> Download
        </button>
      </div>

      {sortedDates.length === 0 ? (
        <div className="text-center py-12 bg-bg-secondary rounded-lg transition-colors">
          <p className="text-text-secondary transition-colors">No income transactions found</p>
        </div>
      ) : (
        <div className="space-y-6">
          {sortedDates.map((dateKey) => {
            const dateTransactions = groupedTransactions.get(dateKey) || [];
            const dateHeader = formatDateHeader(dateKey);
            const fullDate = DateTime.fromISO(dateKey).toFormat("MMM d, yyyy");

            return (
              <div key={dateKey} className="space-y-3">
                <div className="flex items-center gap-3 pb-2 border-b border-border transition-colors">
                  <h6 className="text-sm font-semibold text-text-primary transition-colors">
                    {dateHeader}
                  </h6>
                  {dateHeader !== fullDate && (
                    <span className="text-xs text-text-secondary transition-colors">{fullDate}</span>
                  )}
                  <span className="text-xs text-text-secondary ml-auto transition-colors">
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
                      onDelete={() => onDelete(item._id)}
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

export default IncomeList;
