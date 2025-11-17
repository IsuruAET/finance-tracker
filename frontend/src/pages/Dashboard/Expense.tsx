import { useCallback, useEffect, useState, useRef } from "react";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import type { Transaction } from "../../types/dashboard";
import type { DeleteAlertState } from "../../components/DeleteAlert";
import { API_PATHS } from "../../utils/apiPaths";
import { useDateRange } from "../../context/DateRangeContext";
import toast from "react-hot-toast";
import axiosInstance from "../../utils/axiosInstance";
import axios from "axios";
import ExpenseOverview from "../../components/Expense/ExpenseOverview";
import Modal from "../../components/Modal";
import AddExpenseForm, {
  type ExpenseData,
} from "../../components/Expense/AddExpenseForm";
import ExpenseList from "../../components/Expense/ExpenseList";
import DeleteAlert from "../../components/DeleteAlert";
import DateRangePicker from "../../components/DateRangePicker";
import { MdFilterList } from "react-icons/md";
import { findOrCreateCategory } from "../../utils/helper";
import type { TransactionApiResponse } from "../../types/dashboard";

const Expense = () => {
  const { dateRange } = useDateRange();
  const [expenseData, setExpenseData] = useState<Transaction[]>([]);
  const loadingRef = useRef(false);
  const [openDeleteAlert, setOpenDeleteAlert] = useState<DeleteAlertState>({
    show: false,
    data: null,
  });
  const [openAddExpenseModal, setOpenAddExpenseModal] = useState(false);

  // Get All Expense Details
  const fetchExpenseDetails = useCallback(async () => {
    if (loadingRef.current) return;

    loadingRef.current = true;

    try {
      // Format dates as YYYY-MM-DD for API
      const startDate = dateRange.startDate.toISOString().split("T")[0];
      const endDate = dateRange.endDate.toISOString().split("T")[0];

      const response = await axiosInstance.get<TransactionApiResponse[]>(
        `${API_PATHS.TRANSACTIONS.GET_ALL}`,
        {
          params: {
            startDate,
            endDate,
            type: "EXPENSE",
          },
        }
      );

      if (response.data) {
        // Map the response to match the expected Transaction format
        const mappedData: Transaction[] = response.data.map(
          (item: TransactionApiResponse) => ({
            _id: item._id,
            userId: item.userId,
            date: item.date,
            amount: item.amount,
            source: item.categoryId?.name || item.desc || "",
            category: item.categoryId?.name || item.desc || "",
            icon: item.categoryId?.icon || "",
            type: item.type.toLowerCase() as "income" | "expense" | "transfer",
            note: item.desc,
            walletId: item.walletId?._id || item.walletId,
            fromWalletId: item.fromWalletId
              ? {
                  _id: item.fromWalletId._id,
                  name: item.fromWalletId.name,
                  icon: item.fromWalletId.type,
                }
              : undefined,
            toWalletId: item.toWalletId
              ? {
                  _id: item.toWalletId._id,
                  name: item.toWalletId.name,
                  icon: item.toWalletId.type,
                }
              : undefined,
          })
        );
        setExpenseData(mappedData);
      }
    } catch (error) {
      console.error("Something went wrong. Please try again", error);
    } finally {
      loadingRef.current = false;
    }
  }, [dateRange]);

  // Handle Add Expense
  const handleAddExpense = async (expense: ExpenseData) => {
    const { category, amount, date, icon, walletId } = expense;

    if (!category.trim()) {
      toast.error("Category is required.");
      return;
    }

    if (!amount || isNaN(amount) || Number(amount) <= 0) {
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
      // Find or create category
      const categoryId = await findOrCreateCategory(category, "EXPENSE", icon);

      if (!categoryId) {
        toast.error("Failed to create or find category. Please try again.");
        return;
      }

      await axiosInstance.post(API_PATHS.TRANSACTIONS.ADD, {
        type: "EXPENSE",
        amount: Number(amount),
        date,
        walletId,
        categoryId,
        desc: category,
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

      setOpenDeleteAlert({ show: false, data: null });
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
      const startDate = dateRange.startDate.toISOString().split("T")[0];
      const endDate = dateRange.endDate.toISOString().split("T")[0];

      const response = await axiosInstance.get(
        API_PATHS.TRANSACTIONS.DOWNLOAD_EXCEL,
        {
          responseType: "blob",
          params: {
            startDate,
            endDate,
            type: "EXPENSE",
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
    fetchExpenseDetails();
  }, [fetchExpenseDetails]);

  return (
    <DashboardLayout activeMenu="Expense">
      <div className="my-5 mx-auto">
        <div className="mb-4 flex items-center justify-start gap-3">
          <MdFilterList className="text-gray-600 text-xl ml-2" />
          <DateRangePicker />
        </div>
        <div className="grid grid-cols-1 gap-6">
          <div>
            <ExpenseOverview
              transactions={expenseData}
              onAddExpense={() => setOpenAddExpenseModal(true)}
            />
          </div>

          <ExpenseList
            transactions={expenseData}
            onDelete={(id) => {
              setOpenDeleteAlert({ show: true, data: id });
            }}
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

        <Modal
          isOpen={openDeleteAlert.show}
          onClose={() => setOpenDeleteAlert({ show: false, data: null })}
          title="Delete Expense"
        >
          <DeleteAlert
            content="Are you sure you want to delete this expense details?"
            onDelete={() => deleteExpense(openDeleteAlert.data!)}
          />
        </Modal>
      </div>
    </DashboardLayout>
  );
};

export default Expense;
