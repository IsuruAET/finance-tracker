import { useState, useEffect } from "react";
import { DateTime } from "luxon";
import Input from "../Inputs/Input";
import Select from "../Inputs/Select";
import DatePicker from "../Inputs/DatePicker";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import toast from "react-hot-toast";
import { formatCurrency, categorizeWallets } from "../../utils/helper";
import { useClientConfig } from "../../context/ClientConfigContext";

interface Wallet {
  _id: string;
  name: string;
  type: "CASH" | "BANK" | "CARD" | "OTHER";
  balance: number;
  icon?: string;
  createdAt?: string;
  initializedAt?: string;
}

interface TransferFormProps {
  onTransferComplete: () => void;
}

const TransferForm = ({ onTransferComplete }: TransferFormProps) => {
  const { config } = useClientConfig();
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [fromWalletId, setFromWalletId] = useState("");
  const [toWalletId, setToWalletId] = useState("");
  const [amount, setAmount] = useState<string>("0");
  const [date, setDate] = useState(DateTime.now().toISODate() || "");
  const [note, setNote] = useState("");

  useEffect(() => {
    const fetchWallets = async () => {
      try {
        const response = await axiosInstance.get<Wallet[]>(
          API_PATHS.WALLET.GET_ALL
        );
        setWallets(response.data);
      } catch (error) {
        console.error("Error fetching wallets", error);
        toast.error("Failed to load wallets");
      }
    };
    fetchWallets();
  }, []);

  const handleSubmit = async () => {
    const transferAmount = Number(amount);

    if (
      !fromWalletId ||
      !toWalletId ||
      !transferAmount ||
      transferAmount <= 0
    ) {
      toast.error("Please fill all required fields with valid values");
      return;
    }

    if (fromWalletId === toWalletId) {
      toast.error("Cannot transfer to the same wallet");
      return;
    }

    const selectedFromWallet = wallets.find((w) => w._id === fromWalletId);
    if (selectedFromWallet && transferAmount > selectedFromWallet.balance) {
      toast.error(
        `Insufficient balance. Available: ${formatCurrency(
          selectedFromWallet.balance
        )}`
      );
      return;
    }

    try {
      await axiosInstance.post(API_PATHS.WALLET.TRANSFER, {
        fromWalletId,
        toWalletId,
        amount: transferAmount,
        date,
        note,
      });

      toast.success("Transfer completed successfully!");
      onTransferComplete();
    } catch (error: unknown) {
      const errorMessage =
        error && typeof error === "object" && "response" in error
          ? (error.response as { data?: { message?: string } })?.data?.message
          : undefined;
      toast.error(errorMessage || "Failed to complete transfer");
    }
  };

  const fromWalletGroups = categorizeWallets(wallets);
  const toWalletGroups = categorizeWallets(
    wallets.filter((w) => w._id !== fromWalletId)
  );

  const selectedFromWallet = wallets.find((w) => w._id === fromWalletId);
  const transferAmount = Number(amount) || 0;

  return (
    <div>
      <Select
        value={fromWalletId}
        onChange={(e) => setFromWalletId(e.target.value)}
        label="From Wallet"
        placeholder="Select source wallet"
        groups={fromWalletGroups}
        required
      />

      <Select
        value={toWalletId}
        onChange={(e) => setToWalletId(e.target.value)}
        label="To Wallet"
        placeholder="Select destination wallet"
        groups={toWalletGroups}
        required
      />

      <Input
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        label="Amount"
        placeholder="0"
        type="number"
      />

      {selectedFromWallet && transferAmount > selectedFromWallet.balance && (
        <p className="text-red-600 dark:text-red-400 text-sm mt-1 mb-4 transition-colors">
          Insufficient balance. Available:{" "}
          {formatCurrency(selectedFromWallet.balance)}
        </p>
      )}

      <DatePicker
        value={date}
        onChange={setDate}
        label="Date"
        placeholder="Select a date"
        minDate={config?.earliestWalletDate || undefined}
      />

      <Input
        value={note}
        onChange={(e) => setNote(e.target.value)}
        label="Note (Optional)"
        placeholder="Add a note"
        type="text"
      />

      <div className="flex justify-end mt-6">
        <button
          type="button"
          className="add-btn add-btn-fill"
          onClick={handleSubmit}
        >
          Transfer
        </button>
      </div>
    </div>
  );
};

export default TransferForm;
