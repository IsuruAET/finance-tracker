import { useState } from "react";
import { LuDownload } from "react-icons/lu";
import { HiViewList, HiViewGrid } from "react-icons/hi";
import TransactionInfoCard from "../Cards/TransactionInfoCard";
import type { TransactionApiResponse } from "../../types/dashboard";
import {
  groupTransactionsByDate,
  formatDateHeader,
  groupTransactionsByCategory,
  formatCurrency,
} from "../../utils/helper";
import { DateTime } from "luxon";

interface ExpenseListProps {
  transactions: TransactionApiResponse[];
  onDelete: (id: string) => void;
  onDownload: () => void;
}

type ViewMode = "date" | "category";

const ExpenseList = ({
  transactions,
  onDelete,
  onDownload,
}: ExpenseListProps) => {
  const [viewMode, setViewMode] = useState<ViewMode>("date");

  const groupedTransactions = groupTransactionsByDate(transactions);
  const categoryGroupedTransactions = groupTransactionsByCategory(transactions);

  // Sort dates in descending order (newest first)
  const sortedDates = Array.from(groupedTransactions.keys()).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  );

  const renderDateView = () => {
    if (sortedDates.length === 0) {
      return (
        <div className="text-center py-12 bg-bg-secondary rounded-lg transition-colors">
          <p className="text-text-secondary transition-colors">
            No expense transactions found
          </p>
        </div>
      );
    }

    return (
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
                  <span className="text-xs text-text-secondary transition-colors">
                    {fullDate}
                  </span>
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
    );
  };

  const renderCategoryView = () => {
    if (categoryGroupedTransactions.length === 0) {
      return (
        <div className="text-center py-12 bg-bg-secondary rounded-lg transition-colors">
          <p className="text-text-secondary transition-colors">
            No expense transactions found
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {categoryGroupedTransactions.map((category) => {
          // Get the latest transaction date for this category
          const latestTransaction = category.transactions[0]; // Already sorted by date desc
          const latestDate = latestTransaction
            ? DateTime.fromISO(latestTransaction.date).toFormat("MMM d, yyyy")
            : "";

          return (
            <div key={category.categoryId} className="space-y-3">
              <div className="flex items-center gap-3 pb-2 border-b border-border transition-colors">
                <div className="flex items-center gap-3">
                  {category.categoryIcon && (
                    <div className="w-10 h-10 flex items-center justify-center bg-gray-100 dark:bg-bg-tertiary rounded-full transition-colors shrink-0">
                      <img
                        src={category.categoryIcon}
                        alt={category.categoryName}
                        className="w-6 h-6"
                      />
                    </div>
                  )}
                  <div>
                    <h6 className="text-sm font-semibold text-text-primary transition-colors">
                      {category.categoryName}
                    </h6>
                    {latestDate && (
                      <span className="text-xs text-text-secondary transition-colors">
                        {latestDate}
                      </span>
                    )}
                  </div>
                </div>
                <div className="ml-auto text-right">
                  <p className="text-sm font-semibold text-text-primary transition-colors">
                    {formatCurrency(category.total)}
                  </p>
                  <span className="text-xs text-text-secondary transition-colors">
                    {category.count}{" "}
                    {category.count === 1 ? "transaction" : "transactions"}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {category.transactions.map((item) => (
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
    );
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <h5 className="text-lg font-semibold">All Expenses</h5>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-bg-secondary rounded-lg p-1 transition-colors">
            <button
              onClick={() => setViewMode("date")}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                viewMode === "date"
                  ? "bg-primary text-white"
                  : "text-text-secondary hover:text-text-primary"
              }`}
              title="View by Date"
            >
              <HiViewList className="text-base" />
            </button>
            <button
              onClick={() => setViewMode("category")}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                viewMode === "category"
                  ? "bg-primary text-white"
                  : "text-text-secondary hover:text-text-primary"
              }`}
              title="View by Category"
            >
              <HiViewGrid className="text-base" />
            </button>
          </div>

          <button
            className="px-3 py-1.5 md:px-4 rounded-md md:rounded-lg text-sm font-medium text-text-secondary hover:text-purple-500 bg-bg-secondary hover:bg-purple-50 dark:hover:bg-purple-900/20 border border-border cursor-pointer transition-colors flex items-center gap-1 md:gap-3"
            onClick={onDownload}
            title="Download"
          >
            <LuDownload className="text-base" />{" "}
            <span className="hidden md:inline">Download</span>
          </button>
        </div>
      </div>

      {viewMode === "date" ? renderDateView() : renderCategoryView()}
    </div>
  );
};

export default ExpenseList;
