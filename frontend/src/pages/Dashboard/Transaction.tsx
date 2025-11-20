import { useCallback, useEffect, useRef, useState } from "react";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import TransactionOverview from "../../components/Transactions/TransactionOverview";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import { useDateRange } from "../../context/DateRangeContext";
import toast from "react-hot-toast";
import TransactionList from "../../components/Transactions/TransactionList";
import type { TransactionApiResponse } from "../../types/dashboard";
import DateRangePicker from "../../components/DateRangePicker/DateRangePicker";
import { MdFilterList } from "react-icons/md";
import axios from "axios";

const Transaction = () => {
  const { dateRange } = useDateRange();
  const [transactions, setTransactions] = useState<TransactionApiResponse[]>(
    []
  );
  const loadingRef = useRef(false);

  const fetchTransactions = useCallback(async () => {
    if (loadingRef.current) return;

    loadingRef.current = true;

    try {
      const startDate = dateRange.startDate.toISOString().split("T")[0];
      const endDate = dateRange.endDate.toISOString().split("T")[0];

      const response = await axiosInstance.get<TransactionApiResponse[]>(
        `${API_PATHS.TRANSACTIONS.GET_ALL}`,
        {
          params: {
            startDate,
            endDate,
          },
        }
      );

      if (response.data) {
        setTransactions(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch transactions", error);
      toast.error("Unable to load transactions. Please try again.");
    } finally {
      loadingRef.current = false;
    }
  }, [dateRange]);

  const handleDownloadTransactions = async () => {
    try {
      const startDate = dateRange.startDate.toISOString().split("T")[0];
      const endDate = dateRange.endDate.toISOString().split("T")[0];

      const response = await axiosInstance.get(
        API_PATHS.TRANSACTIONS.DOWNLOAD_EXCEL,
        {
          responseType: "blob",
          params: {
            startDate,
            endDate,
          },
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "transactions.xlsx");
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error(
          error.response?.data?.message ||
            "Failed to download transactions. Please try again."
        );
      } else {
        console.error("Failed to download transactions. Please try again.");
      }
      toast.error("Failed to download transactions. Please try again.");
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  return (
    <DashboardLayout activeMenu="Transactions">
      <div className="my-5 mx-auto">
        <div className="mb-4 flex items-center justify-start gap-3">
          <MdFilterList className="text-gray-600 text-xl ml-2" />
          <DateRangePicker />
        </div>

        <div className="grid grid-cols-1 gap-6">
          <TransactionOverview transactions={transactions} />

          <TransactionList
            transactions={transactions}
            onDownload={handleDownloadTransactions}
          />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Transaction;
