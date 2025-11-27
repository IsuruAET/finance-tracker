import { useCallback, useEffect, useRef, useState } from "react";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import { API_PATHS } from "../../utils/apiPaths";
import { useDateRange } from "../../context/DateRangeContext";
import { useWalletFilter } from "../../context/WalletFilterContext";
import toast from "react-hot-toast";
import axiosInstance from "../../utils/axiosInstance";
import axios from "axios";
import { formatLocalDate } from "../../utils/helper";
import ExpenseOverview from "../../components/Expense/ExpenseOverview";
import Modal from "../../components/Modal";
import AddExpenseForm, {
  type ExpenseData,
} from "../../components/Expense/AddExpenseForm";
import ExpenseList from "../../components/Expense/ExpenseList";
import FilterSection from "../../components/FilterSection/FilterSection";
import type { TransactionApiResponse } from "../../types/dashboard";

type Wallet = {
  _id: string;
  name: string;
  type: "CASH" | "BANK" | "CARD" | "OTHER";
  balance: number;
  icon?: string;
};

const Expense = () => {
  const { dateRange } = useDateRange();
  const { selectedWalletId, setSelectedWalletId } = useWalletFilter();
  const [expenseData, setExpenseData] = useState<TransactionApiResponse[]>([]);
  const loadingRef = useRef(false);
  const [openAddExpenseModal, setOpenAddExpenseModal] = useState(false);
  const [wallets, setWallets] = useState<Wallet[]>([]);

  // Get All Expense Details
  const fetchExpenseDetails = useCallback(async () => {
    if (loadingRef.current) return;

    loadingRef.current = true;

    try {
      // Format dates as YYYY-MM-DD for API
      const startDate = formatLocalDate(dateRange.startDate);
      const endDate = formatLocalDate(dateRange.endDate);

      const response = await axiosInstance.get<TransactionApiResponse[]>(
        `${API_PATHS.TRANSACTIONS.GET_ALL}`,
        {
          params: {
            startDate,
            endDate,
            type: "EXPENSE",
            walletId: selectedWalletId || undefined,
          },
        }
      );

      if (response.data) {
        setExpenseData(response.data);
      }
    } catch (error) {
      console.error("Something went wrong. Please try again", error);
    } finally {
      loadingRef.current = false;
    }
  }, [dateRange, selectedWalletId]);

  // Fetch wallets for filter
  const fetchWallets = useCallback(async () => {
    try {
      const response = await axiosInstance.get<Wallet[]>(
        API_PATHS.WALLET.GET_ALL
      );
      setWallets(response.data || []);
    } catch (error) {
      console.error("Failed to load wallets for filters", error);
      toast.error("Unable to load wallets. Wallet filter may be incomplete.");
    }
  }, []);

  // Handle Add Expense
  const handleAddExpense = async (expense: ExpenseData) => {
    const { categoryId, amount, date, walletId, desc } = expense;
    const numericAmount = Number(amount);

    if (!categoryId) {
      toast.error("Category is required.");
      return;
    }

    if (!amount || Number.isNaN(numericAmount) || numericAmount <= 0) {
      toast.error("Amount should be a valid number greater than 0");
      return;
    }

    if (!date) {
      toast.error("Date is required.");
      return;
    }

    if (!walletId) {
      toast.error("Please select a wallet");
      return;
    }

    try {
      await axiosInstance.post(API_PATHS.TRANSACTIONS.ADD, {
        type: "EXPENSE",
        amount: numericAmount,
        date,
        walletId,
        categoryId,
        desc,
      });

      setOpenAddExpenseModal(false);
      toast.success("Expense added successfully");
      fetchExpenseDetails();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        // ✅ This safely checks if it's an AxiosError
        console.error(
          error.response?.data?.message ||
            "Something went wrong. Please try again."
        );
        toast.error(
          error.response?.data?.message ||
            "Something went wrong. Please try again."
        );
      } else {
        console.error("Something went wrong. Please try again.");
        toast.error("Something went wrong. Please try again.");
      }
    }
  };

  // Delete Expense
  const deleteExpense = async (id: string) => {
    try {
      await axiosInstance.delete(API_PATHS.TRANSACTIONS.DELETE(id));

      toast.success("Expense details deleted successfully");
      fetchExpenseDetails();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        // ✅ This safely checks if it's an AxiosError
        console.error(
          error.response?.data?.message ||
            "Something went wrong. Please try again."
        );
        toast.error(
          error.response?.data?.message ||
            "Something went wrong. Please try again."
        );
      } else {
        console.error("Something went wrong. Please try again.");
        toast.error("Something went wrong. Please try again.");
      }
    }
  };

  // handle download expense details
  const handleDownloadExpenseDetails = async () => {
    try {
      // Format dates as YYYY-MM-DD for API
      const startDate = formatLocalDate(dateRange.startDate);
      const endDate = formatLocalDate(dateRange.endDate);

      const response = await axiosInstance.get(
        API_PATHS.TRANSACTIONS.DOWNLOAD_EXCEL,
        {
          responseType: "blob",
          params: {
            startDate,
            endDate,
            type: "EXPENSE",
            walletId: selectedWalletId || undefined,
          },
        }
      );

      // Create a URL for the blob
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "expense_details.xlsx");
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        // ✅ This safely checks if it's an AxiosError
        console.error(
          error.response?.data?.message ||
            "Something went wrong. Please try again."
        );
      } else {
        console.error("Something went wrong. Please try again.");
      }
      toast.error("Failed to download expense details. Please try again.");
    }
  };

  useEffect(() => {
    fetchWallets();
    fetchExpenseDetails();
  }, [fetchExpenseDetails, fetchWallets]);

  const walletOptions =
    wallets.length > 0
      ? [
          { value: "", label: "All wallets" },
          ...wallets.map((wallet) => ({
            value: wallet._id,
            label: wallet.name,
            icon: wallet.icon,
          })),
        ]
      : [{ value: "", label: "All wallets" }];

  const walletGroups =
    wallets.length > 0
      ? [
          {
            label: "Cash wallets",
            options: wallets
              .filter((wallet) => wallet.type === "CASH")
              .map((wallet) => ({
                value: wallet._id,
                label: wallet.name,
                icon: wallet.icon,
              })),
          },
          {
            label: "Card wallets",
            options: wallets
              .filter((wallet) => wallet.type === "CARD")
              .map((wallet) => ({
                value: wallet._id,
                label: wallet.name,
                icon: wallet.icon,
              })),
          },
          {
            label: "Other wallets",
            options: wallets
              .filter(
                (wallet) => wallet.type !== "CASH" && wallet.type !== "CARD"
              )
              .map((wallet) => ({
                value: wallet._id,
                label: wallet.name,
                icon: wallet.icon,
              })),
          },
        ].filter((group) => group.options.length > 0)
      : [];

  return (
    <DashboardLayout activeMenu="Expense">
      <div className="my-5 mx-auto">
        <FilterSection
          selectedWalletId={selectedWalletId}
          onWalletChange={(e) => setSelectedWalletId(e.target.value)}
          walletOptions={walletOptions}
          walletGroups={walletGroups}
        />
        <div className="grid grid-cols-1 gap-6">
          <div>
            <ExpenseOverview
              transactions={expenseData}
              onAddExpense={() => setOpenAddExpenseModal(true)}
            />
          </div>

          <ExpenseList
            transactions={expenseData}
            onDelete={deleteExpense}
            onDownload={handleDownloadExpenseDetails}
          />
        </div>

        <Modal
          isOpen={openAddExpenseModal}
          onClose={() => setOpenAddExpenseModal(false)}
          title="Add Expense"
        >
          <AddExpenseForm onAddExpense={handleAddExpense} />
        </Modal>
      </div>
    </DashboardLayout>
  );
};

export default Expense;
