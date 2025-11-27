import { useCallback, useEffect, useRef, useState } from "react";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import TransactionOverview from "../../components/Transactions/TransactionOverview";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import { useDateRange } from "../../context/DateRangeContext";
import { useWalletFilter } from "../../context/WalletFilterContext";
import toast from "react-hot-toast";
import TransactionList from "../../components/Transactions/TransactionList";
import type { TransactionApiResponse } from "../../types/dashboard";
import axios from "axios";
import FilterSection from "../../components/FilterSection/FilterSection";
import { formatLocalDate } from "../../utils/helper";

type Wallet = {
  _id: string;
  name: string;
  type: "CASH" | "BANK" | "CARD" | "OTHER";
  balance: number;
  icon?: string;
};

const Transaction = () => {
  const { dateRange } = useDateRange();
  const { selectedWalletId, setSelectedWalletId } = useWalletFilter();
  const [transactions, setTransactions] = useState<TransactionApiResponse[]>(
    []
  );
  const loadingRef = useRef(false);
  const [wallets, setWallets] = useState<Wallet[]>([]);

  const fetchTransactions = useCallback(async () => {
    if (loadingRef.current) return;

    loadingRef.current = true;

    try {
      const startDate = formatLocalDate(dateRange.startDate);
      const endDate = formatLocalDate(dateRange.endDate);

      const response = await axiosInstance.get<TransactionApiResponse[]>(
        `${API_PATHS.TRANSACTIONS.GET_ALL}`,
        {
          params: {
            startDate,
            endDate,
            walletId: selectedWalletId || undefined,
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

  const handleDownloadTransactions = async () => {
    try {
      const startDate = formatLocalDate(dateRange.startDate);
      const endDate = formatLocalDate(dateRange.endDate);

      const response = await axiosInstance.get(
        API_PATHS.TRANSACTIONS.DOWNLOAD_EXCEL,
        {
          responseType: "blob",
          params: {
            startDate,
            endDate,
            walletId: selectedWalletId || undefined,
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
    fetchWallets();
    fetchTransactions();
  }, [fetchTransactions, fetchWallets]);

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
    <DashboardLayout activeMenu="Transaction">
      <div className="my-5 mx-auto">
        <FilterSection
          selectedWalletId={selectedWalletId}
          onWalletChange={(e) => setSelectedWalletId(e.target.value)}
          walletOptions={walletOptions}
          walletGroups={walletGroups}
        />

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
