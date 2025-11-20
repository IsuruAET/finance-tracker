import { useCallback, useEffect, useState, useRef } from "react";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import Modal from "../../components/Modal";
import TransferForm from "../../components/Wallet/TransferForm";
import AddWalletForm from "../../components/Wallet/AddWalletForm";
import DeleteAlert, {
  type DeleteAlertState,
} from "../../components/DeleteAlert";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import toast from "react-hot-toast";
import { formatCurrency, formatDate } from "../../utils/helper";
import { LuPlus, LuTrash2 } from "react-icons/lu";
import TransferList from "../../components/Wallet/TransferList";
import axios from "axios";
import InfoCard from "../../components/Cards/InfoCard";
import type { TransactionApiResponse } from "../../types/dashboard";

interface Wallet {
  _id: string;
  name: string;
  type: "CASH" | "BANK" | "CARD" | "OTHER";
  balance: number;
  icon?: string;
  createdAt?: string;
  initializedAt?: string;
}

interface BackendTransfer {
  _id: string;
  fromWalletId:
    | {
        _id: string;
        name: string;
        type: "CASH" | "BANK" | "CARD" | "OTHER";
      }
    | string;
  toWalletId:
    | {
        _id: string;
        name: string;
        type: "CASH" | "BANK" | "CARD" | "OTHER";
      }
    | string;
  amount: number;
  date: string;
  desc?: string;
  note?: string;
}

const Wallet = () => {
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [transfers, setTransfers] = useState<TransactionApiResponse[]>([]);
  const loadingRef = useRef(false);
  const transfersLoadingRef = useRef(false);
  const [openTransferModal, setOpenTransferModal] = useState(false);
  const [openAddWalletModal, setOpenAddWalletModal] = useState(false);
  const [openDeleteAlert, setOpenDeleteAlert] = useState<DeleteAlertState>({
    show: false,
    data: null,
  });

  const fetchWallets = useCallback(async () => {
    if (loadingRef.current) return;

    loadingRef.current = true;

    try {
      const response = await axiosInstance.get<Wallet[]>(
        API_PATHS.WALLET.GET_ALL
      );

      if (response.data) {
        setWallets(response.data);
      }
    } catch (error) {
      console.error("Something went wrong. Please try again", error);
      toast.error("Failed to load wallets");
    } finally {
      loadingRef.current = false;
    }
  }, []);

  const fetchTransfers = useCallback(async () => {
    if (transfersLoadingRef.current) return;
    transfersLoadingRef.current = true;
    try {
      const response = await axiosInstance.get<BackendTransfer[]>(
        API_PATHS.WALLET.GET_TRANSFERS
      );
      if (response.data) {
        // Map backend transfer format to TransactionApiResponse format
        const mappedTransfers: TransactionApiResponse[] = response.data.map(
          (transfer) => {
            const fromWallet =
              typeof transfer.fromWalletId === "string"
                ? {
                    _id: transfer.fromWalletId,
                    name: "",
                    type: "CASH",
                  }
                : transfer.fromWalletId;
            const toWallet =
              typeof transfer.toWalletId === "string"
                ? { _id: transfer.toWalletId, name: "", type: "CASH" }
                : transfer.toWalletId;

            return {
              _id: transfer._id,
              userId: "",
              type: "TRANSFER" as const,
              amount: transfer.amount,
              date: transfer.date,
              desc: transfer.desc || transfer.note,
              fromWalletId: {
                _id: fromWallet._id,
                name: fromWallet.name,
                type: fromWallet.type,
              },
              toWalletId: {
                _id: toWallet._id,
                name: toWallet.name,
                type: toWallet.type,
              },
            };
          }
        );
        setTransfers(mappedTransfers);
      }
    } catch (error) {
      console.error("Failed to load transfers", error);
      toast.error("Failed to load transfers");
    } finally {
      transfersLoadingRef.current = false;
    }
  }, []);

  const handleTransferComplete = () => {
    setOpenTransferModal(false);
    fetchWallets();
    fetchTransfers();
  };

  const handleAddWalletComplete = () => {
    setOpenAddWalletModal(false);
    fetchWallets();
  };

  const handleDeleteWalletClick = (walletId: string) => {
    // Prevent deletion if there's only one wallet
    if (wallets.length === 1) {
      toast.error("Cannot delete the last remaining wallet");
      return;
    }

    setOpenDeleteAlert({ show: true, data: walletId });
  };

  const deleteWallet = async (walletId: string) => {
    try {
      await axiosInstance.delete(API_PATHS.WALLET.DELETE_WALLET(walletId));
      setOpenDeleteAlert({ show: false, data: null });
      toast.success("Wallet deleted successfully");
      fetchWallets();
    } catch (error: unknown) {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.message || "Failed to delete wallet"
        : "Failed to delete wallet";
      toast.error(message);
    }
  };

  const handleDownloadTransferDetails = async () => {
    try {
      const response = await axiosInstance.get(
        API_PATHS.TRANSACTIONS.DOWNLOAD_EXCEL,
        {
          responseType: "blob",
          params: {
            type: "TRANSFER",
          },
        }
      );

      // Create a URL for the blob
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "transfer_details.xlsx");
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error(
          error.response?.data?.message ||
            "Something went wrong. Please try again."
        );
      } else {
        console.error("Something went wrong. Please try again.");
      }
      toast.error("Failed to download transfer details. Please try again.");
    }
  };

  useEffect(() => {
    fetchWallets();
    fetchTransfers();
  }, [fetchWallets, fetchTransfers]);

  const totalBalance = wallets.reduce((sum, wallet) => sum + wallet.balance, 0);
  const cashWallets = wallets.filter((wallet) => wallet.type === "CASH");
  const cardWallets = wallets.filter(
    (wallet) => wallet.type === "CARD" || wallet.type === "BANK"
  );
  const cashBalance = cashWallets.reduce(
    (sum, wallet) => sum + wallet.balance,
    0
  );
  const cardBalance = cardWallets.reduce(
    (sum, wallet) => sum + wallet.balance,
    0
  );

  const renderWalletIcon = (wallet: Wallet) => {
    const icon = wallet.icon || "💳";
    const isUrl = icon.startsWith("http://") || icon.startsWith("https://");

    if (isUrl) {
      return <img src={icon} alt={wallet.name} className="w-6 h-6" />;
    }
    return <span className="text-2xl leading-none">{icon}</span>;
  };

  const renderWalletCard = (wallet: Wallet) => {
    // Hide delete button if there's only one wallet
    const canDelete = wallets.length > 1;
    const getWalletColor = (type: Wallet["type"]) => {
      switch (type) {
        case "CASH":
          return "bg-green-50";
        case "CARD":
        case "BANK":
          return "bg-blue-50";
        case "OTHER":
          return "bg-purple-50";
        default:
          return "bg-gray-50";
      }
    };
    const color = getWalletColor(wallet.type);

    return (
      <div key={wallet._id} className="relative group">
        <InfoCard
          icon={renderWalletIcon(wallet)}
          label={wallet.name}
          value={wallet.balance}
          color={color}
          desc={formatDate(wallet?.initializedAt || "")}
        />
        {canDelete && (
          <button
            onClick={() => handleDeleteWalletClick(wallet._id)}
            className="absolute top-2 right-2 text-text-secondary hover:text-red-500 dark:hover:text-red-400 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 focus-visible:opacity-100 transition-all cursor-pointer p-1 rounded bg-bg-primary dark:bg-bg-secondary border border-border shadow-sm"
            title="Delete wallet"
          >
            <LuTrash2 className="h-5 w-5" />
          </button>
        )}
      </div>
    );
  };

  return (
    <DashboardLayout activeMenu="Wallet">
      <div className="my-5 mx-auto">
        <div className="grid grid-cols-1 gap-6">
          <div className="card">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h5 className="text-lg">My Wallets</h5>
                <div className="flex flex-col mt-2">
                  <span className="text-sm text-text-secondary">
                    Total Balance
                  </span>
                  <span className="text-[22px] font-medium text-text-primary">
                    {formatCurrency(totalBalance)}
                  </span>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  className="add-btn"
                  onClick={() => setOpenAddWalletModal(true)}
                >
                  <LuPlus className="text-lg" />
                  Add Wallet
                </button>
                <button
                  className="add-btn add-btn-fill disabled:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-50"
                  onClick={() => setOpenTransferModal(true)}
                  disabled={wallets.length <= 1}
                >
                  Transfer Money
                </button>
              </div>
            </div>
          </div>

          {/* Cash/Savings Wallets Section */}
          <div className="card">
            <div className="flex flex-row items-start justify-between mb-4">
              <h5 className="text-lg">Cash in Hand</h5>
              <div className="flex flex-col items-end">
                <span className="text-sm text-text-secondary">
                  Total Balance
                </span>
                <span className="text-[22px] font-medium text-text-primary">
                  {formatCurrency(cashBalance)}
                </span>
              </div>
            </div>
            {cashWallets.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {cashWallets.map(renderWalletCard)}
              </div>
            ) : (
              <div className="text-center py-8 bg-bg-secondary rounded-lg">
                <p className="text-text-secondary">No cash wallets found</p>
              </div>
            )}
          </div>

          {/* Card Wallets Section */}
          <div className="card">
            <div className="flex flex-row items-start justify-between mb-4">
              <h5 className="text-lg">Card Wallets</h5>
              <div className="flex flex-col items-end">
                <span className="text-sm text-text-secondary">
                  Total Balance
                </span>
                <span className="text-[22px] font-medium text-text-primary">
                  {formatCurrency(cardBalance)}
                </span>
              </div>
            </div>
            {cardWallets.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {cardWallets.map(renderWalletCard)}
              </div>
            ) : (
              <div className="text-center py-8 bg-bg-secondary rounded-lg">
                <p className="text-text-secondary">No card wallets found</p>
              </div>
            )}
          </div>

          <TransferList
            transactions={transfers}
            onDownload={handleDownloadTransferDetails}
          />
        </div>

        <Modal
          isOpen={openTransferModal}
          onClose={() => setOpenTransferModal(false)}
          title="Transfer Money"
        >
          <TransferForm onTransferComplete={handleTransferComplete} />
        </Modal>

        <Modal
          isOpen={openAddWalletModal}
          onClose={() => setOpenAddWalletModal(false)}
          title="Add Wallet"
        >
          <AddWalletForm
            walletType="CASH"
            onAddComplete={handleAddWalletComplete}
          />
        </Modal>

        <Modal
          isOpen={openDeleteAlert.show}
          onClose={() => setOpenDeleteAlert({ show: false, data: null })}
          title="Delete Wallet"
        >
          <DeleteAlert
            content="Are you sure you want to delete this wallet? This action cannot be undone."
            onDelete={() => deleteWallet(openDeleteAlert.data!)}
          />
        </Modal>
      </div>
    </DashboardLayout>
  );
};

export default Wallet;
