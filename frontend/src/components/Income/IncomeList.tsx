import { useState } from "react";
import { LuDownload, LuChevronDown } from "react-icons/lu";
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
import Modal from "../Modal";
import DeleteAlert from "../DeleteAlert";

interface IncomeListProps {
  transactions: TransactionApiResponse[];
  onDelete: (id: string) => void;
  onDownload: () => void;
}

type ViewMode = "date" | "category";

const IncomeList = ({
  transactions,
  onDelete,
  onDownload,
}: IncomeListProps) => {
  const [viewMode, setViewMode] = useState<ViewMode>("date");
  const [openDeleteAlert, setOpenDeleteAlert] = useState<{
    show: boolean;
    id: string | null;
  }>({
    show: false,
    id: null,
  });
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set()
  );
  const [expandedDates, setExpandedDates] = useState<Set<string>>(new Set());

  const groupedTransactions = groupTransactionsByDate(transactions);
  const categoryGroupedTransactions = groupTransactionsByCategory(transactions);

  // Sort dates in descending order (newest first)
  const sortedDates = Array.from(groupedTransactions.keys()).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  );

  const toggleDate = (dateKey: string) => {
    setExpandedDates((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(dateKey)) {
        newSet.delete(dateKey);
      } else {
        newSet.add(dateKey);
      }
      return newSet;
    });
  };

  const handleDeleteClick = (id: string) => {
    setOpenDeleteAlert({ show: true, id });
  };

  const handleConfirmDelete = () => {
    if (openDeleteAlert.id) {
      onDelete(openDeleteAlert.id);
    }
    setOpenDeleteAlert({ show: false, id: null });
  };

  const renderDateView = () => {
    if (sortedDates.length === 0) {
      return (
        <div className="text-center py-12 bg-bg-secondary rounded-lg transition-colors">
          <p className="text-text-secondary transition-colors">
            No income transactions found
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {sortedDates.map((dateKey) => {
          const dateTransactions = groupedTransactions.get(dateKey) || [];
          const dateHeader = formatDateHeader(dateKey);
          const dt = DateTime.fromISO(dateKey);
          const fullDate = dt.toFormat("MMM d, yyyy");
          const dayOfWeek = dt.toFormat("EEEE"); // e.g., "Wednesday"
          const isExpanded = expandedDates.has(dateKey);
          const totalAmount = dateTransactions.reduce(
            (sum, transaction) => sum + transaction.amount,
            0
          );

          // Determine what to show as secondary text
          let secondaryText = "";
          if (dateHeader === "Today" || dateHeader === "Yesterday") {
            // Don't show anything for Today/Yesterday
            secondaryText = "";
          } else if (dateHeader === dayOfWeek) {
            // If dateHeader is already the day name (within last 7 days), show full date
            secondaryText = fullDate;
          } else {
            // If dateHeader is "MMM d" format, show day of week instead of full date
            secondaryText = dayOfWeek;
          }

          return (
            <div key={dateKey} className="space-y-3">
              <button
                onClick={() => toggleDate(dateKey)}
                className="w-full flex items-center gap-3 pb-2 border-b border-border transition-colors hover:opacity-80 cursor-pointer"
              >
                <div className="flex items-center gap-3 flex-1">
                  <h6 className="text-sm font-semibold text-text-primary transition-colors">
                    {dateHeader}
                  </h6>
                  {secondaryText && (
                    <span className="text-xs text-text-secondary transition-colors">
                      {secondaryText}
                    </span>
                  )}
                </div>
                <div className="ml-auto flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-sm font-semibold text-text-primary transition-colors">
                      {formatCurrency(totalAmount)}
                    </p>
                    <span className="text-xs text-text-secondary transition-colors">
                      {dateTransactions.length}{" "}
                      {dateTransactions.length === 1
                        ? "transaction"
                        : "transactions"}
                    </span>
                  </div>
                  <LuChevronDown
                    className={`text-text-secondary transition-transform duration-300 ease-in-out ${
                      isExpanded ? "rotate-180" : ""
                    }`}
                    size={20}
                  />
                </div>
              </button>

              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  isExpanded ? "max-h-[5000px] opacity-100" : "max-h-0 opacity-0"
                }`}
              >
                <div
                  className={`grid grid-cols-1 md:grid-cols-2 gap-3 transition-all duration-300 ease-in-out ${
                    isExpanded
                      ? "translate-y-0 opacity-100"
                      : "-translate-y-4 opacity-0"
                  }`}
                >
                  {dateTransactions.map((item) => (
                    <TransactionInfoCard
                      key={item._id}
                      transaction={item}
                      onDelete={() => handleDeleteClick(item._id)}
                    />
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  const renderCategoryView = () => {
    if (categoryGroupedTransactions.length === 0) {
      return (
        <div className="text-center py-12 bg-bg-secondary rounded-lg transition-colors">
          <p className="text-text-secondary transition-colors">
            No income transactions found
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
          const isExpanded = expandedCategories.has(category.categoryId);

          return (
            <div key={category.categoryId} className="space-y-3">
              <button
                onClick={() => toggleCategory(category.categoryId)}
                className="w-full flex items-center gap-3 pb-2 border-b border-border transition-colors hover:opacity-80 cursor-pointer"
              >
                <div className="flex items-center gap-3 flex-1">
                  {category.categoryIcon && (
                    <div className="w-10 h-10 flex items-center justify-center bg-gray-100 dark:bg-bg-tertiary rounded-full transition-colors shrink-0">
                      <img
                        src={category.categoryIcon}
                        alt={category.categoryName}
                        className="w-6 h-6"
                      />
                    </div>
                  )}
                  <div className="text-left">
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
                <div className="ml-auto flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-sm font-semibold text-text-primary transition-colors">
                      {formatCurrency(category.total)}
                    </p>
                    <span className="text-xs text-text-secondary transition-colors">
                      {category.count}{" "}
                      {category.count === 1 ? "transaction" : "transactions"}
                    </span>
                  </div>
                  <LuChevronDown
                    className={`text-text-secondary transition-transform duration-300 ease-in-out ${
                      isExpanded ? "rotate-180" : ""
                    }`}
                    size={20}
                  />
                </div>
              </button>

              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  isExpanded ? "max-h-[5000px] opacity-100" : "max-h-0 opacity-0"
                }`}
              >
                <div
                  className={`grid grid-cols-1 md:grid-cols-2 gap-3 transition-all duration-300 ease-in-out ${
                    isExpanded
                      ? "translate-y-0 opacity-100"
                      : "-translate-y-4 opacity-0"
                  }`}
                >
                  {category.transactions.map((item) => (
                    <TransactionInfoCard
                      key={item._id}
                      transaction={item}
                      onDelete={() => handleDeleteClick(item._id)}
                    />
                  ))}
                </div>
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
        <h5 className="text-lg font-semibold">All Income</h5>

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

      <Modal
        isOpen={openDeleteAlert.show}
        onClose={() => setOpenDeleteAlert({ show: false, id: null })}
        title="Delete Transaction"
      >
        <DeleteAlert
          content="Are you sure you want to delete this transaction?"
          onDelete={handleConfirmDelete}
        />
      </Modal>
    </div>
  );
};

export default IncomeList;
