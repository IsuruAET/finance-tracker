import { useCallback, useEffect, useState, useRef } from "react";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import IncomeOverview from "../../components/Income/IncomeOverview";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import { useDateRange } from "../../context/DateRangeContext";
import Modal from "../../components/Modal";
import AddIncomeForm, {
  type IncomeData,
} from "../../components/Income/AddIncomeForm";
import toast from "react-hot-toast";
import IncomeList from "../../components/Income/IncomeList";
import DeleteAlert, {
  type DeleteAlertState,
} from "../../components/DeleteAlert";
import type {
  Transaction,
  TransactionApiResponse,
} from "../../types/dashboard";
import axios from "axios";
import DateRangePicker from "../../components/DateRangePicker";
import { MdFilterList } from "react-icons/md";

const Income = () => {
  const { dateRange } = useDateRange();
  const [incomeData, setIncomeData] = useState<Transaction[]>([]);
  const loadingRef = useRef(false);
  const [openDeleteAlert, setOpenDeleteAlert] = useState<DeleteAlertState>({
    show: false,
    data: null,
  });
  const [openAddIncomeModal, setOpenAddIncomeModal] = useState(false);

  // Get All Income Details
  const fetchIncomeDetails = useCallback(async () => {
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
            type: "INCOME",
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
        setIncomeData(mappedData);
      }
    } catch (error) {
      console.error("Something went wrong. Please try again", error);
    } finally {
      loadingRef.current = false;
    }
  }, [dateRange]);

  // Handle Add Income
  const handleAddIncome = async (income: IncomeData) => {
    const { categoryId, amount, date, walletId } = income;

    if (!categoryId) {
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
      await axiosInstance.post(API_PATHS.TRANSACTIONS.ADD, {
        type: "INCOME",
        amount: Number(amount),
        date,
        walletId,
        categoryId,
      });

      setOpenAddIncomeModal(false);
      toast.success("Income added successfully");
      fetchIncomeDetails();
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

  // Delete Income
  const deleteIncome = async (id: string) => {
    try {
      await axiosInstance.delete(API_PATHS.TRANSACTIONS.DELETE(id));

      setOpenDeleteAlert({ show: false, data: null });
      toast.success("Income details deleted successfully");
      fetchIncomeDetails();
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

  // handle download income details
  const handleDownloadIncomeDetails = async () => {
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
            type: "INCOME",
          },
        }
      );

      // Create a URL for the blob
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "income_details.xlsx");
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
      toast.error("Failed to download income details. Please try again.");
    }
  };

  useEffect(() => {
    fetchIncomeDetails();
  }, [fetchIncomeDetails]);

  return (
    <DashboardLayout activeMenu="Income">
      <div className="my-5 mx-auto">
        <div className="mb-4 flex items-center justify-start gap-3">
          <MdFilterList className="text-gray-600 text-xl ml-2" />
          <DateRangePicker />
        </div>
        <div className="grid grid-cols-1 gap-6">
          <div>
            <IncomeOverview
              transactions={incomeData}
              onAddIncome={() => setOpenAddIncomeModal(true)}
            />
          </div>

          <IncomeList
            transactions={incomeData}
            onDelete={(id) => {
              setOpenDeleteAlert({ show: true, data: id });
            }}
            onDownload={handleDownloadIncomeDetails}
          />
        </div>

        <Modal
          isOpen={openAddIncomeModal}
          onClose={() => setOpenAddIncomeModal(false)}
          title="Add Income"
        >
          <AddIncomeForm onAddIncome={handleAddIncome} />
        </Modal>

        <Modal
          isOpen={openDeleteAlert.show}
          onClose={() => setOpenDeleteAlert({ show: false, data: null })}
          title="Delete Income"
        >
          <DeleteAlert
            content="Are you sure you want to delete this income details?"
            onDelete={() => deleteIncome(openDeleteAlert.data!)}
          />
        </Modal>
      </div>
    </DashboardLayout>
  );
};

export default Income;
