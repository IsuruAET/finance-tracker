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
import { addThousandsSeparator } from "../../utils/helper";
import { LuPlus, LuTrash2 } from "react-icons/lu";
import TransferList, {
  type Transfer as TransferType,
} from "../../components/Wallet/TransferList";
import axios from "axios";

interface Wallet {
  _id: string;
  name: string;
  type: "cash" | "card";
  balance: number;
  icon?: string;
}

const Wallet = () => {
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [transfers, setTransfers] = useState<TransferType[]>([]);
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
      const response = await axiosInstance.get<TransferType[]>(
        API_PATHS.WALLET.GET_TRANSFERS
      );
      if (response.data) {
        setTransfers(response.data);
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

  useEffect(() => {
    fetchWallets();
    fetchTransfers();
  }, [fetchWallets, fetchTransfers]);

  const totalBalance = wallets.reduce((sum, wallet) => sum + wallet.balance, 0);
  const cashWallets = wallets.filter((wallet) => wallet.type === "cash");
  const cardWallets = wallets.filter((wallet) => wallet.type === "card");
  const cashBalance = cashWallets.reduce(
    (sum, wallet) => sum + wallet.balance,
    0
  );
  const cardBalance = cardWallets.reduce(
    (sum, wallet) => sum + wallet.balance,
    0
  );

  const renderWalletCard = (wallet: Wallet) => {
    // Hide delete button if there's only one wallet
    const canDelete = wallets.length > 1;

    const renderIcon = () => {
      const icon = wallet.icon || "💳";
      const isUrl = icon.startsWith("http://") || icon.startsWith("https://");
      return (
        <div className="w-12 h-12 flex items-center justify-center text-xl text-gray-800 bg-gray-100 rounded-full">
          {isUrl ? (
            <img src={icon} alt={wallet.name} className="w-6 h-6" />
          ) : (
            <span className="text-2xl leading-none">{icon}</span>
          )}
        </div>
      );
    };

    return (
      <div key={wallet._id} className="card relative group">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {renderIcon()}
            <div>
              <h3 className="font-semibold text-gray-800">{wallet.name}</h3>
              <p className="text-xs text-gray-500 capitalize">{wallet.type}</p>
            </div>
          </div>
          {canDelete && (
            <button
              onClick={() => handleDeleteWalletClick(wallet._id)}
              className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer p-1 rounded"
              title="Delete wallet"
            >
              <LuTrash2 className="h-5 w-5" />
            </button>
          )}
        </div>
        <div className="mt-4">
          <p className="text-2xl font-bold text-gray-800">
            {addThousandsSeparator(wallet.balance)}
          </p>
        </div>
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
                <h2 className="text-2xl font-bold text-gray-800">My Wallets</h2>
                <p className="text-gray-600 mt-1">
                  Total Balance: {addThousandsSeparator(totalBalance)}
                </p>
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
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-800">
                Cash in Hand
              </h3>
              <p className="text-gray-600">
                Balance: {addThousandsSeparator(cashBalance)}
              </p>
            </div>
            {cashWallets.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {cashWallets.map(renderWalletCard)}
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <p className="text-gray-500">No cash wallets found</p>
              </div>
            )}
          </div>

          {/* Card Wallets Section */}
          <div className="card">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-800">
                Card Wallets
              </h3>
              <p className="text-gray-600">
                Balance: {addThousandsSeparator(cardBalance)}
              </p>
            </div>
            {cardWallets.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {cardWallets.map(renderWalletCard)}
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <p className="text-gray-500">No card wallets found</p>
              </div>
            )}
          </div>

          <TransferList transfers={transfers} />
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
            walletType="cash"
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
