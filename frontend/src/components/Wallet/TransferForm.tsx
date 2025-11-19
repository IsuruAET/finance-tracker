import { useState, useEffect } from "react";
import Input from "../Inputs/Input";
import Select from "../Inputs/Select";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import toast from "react-hot-toast";

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
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [fromWalletId, setFromWalletId] = useState("");
  const [toWalletId, setToWalletId] = useState("");
  const [amount, setAmount] = useState<string>("0");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
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
        `Insufficient balance. Available: ${selectedFromWallet.balance.toFixed(
          2
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

  const fromWalletOptions = wallets.map((wallet) => ({
    value: wallet._id,
    label: `${wallet.name} (Balance: ${wallet.balance.toFixed(2)})`,
    icon: wallet.icon,
  }));

  const toWalletOptions = wallets
    .filter((w) => w._id !== fromWalletId)
    .map((wallet) => ({
      value: wallet._id,
      label: `${wallet.name} (Balance: ${wallet.balance.toFixed(2)})`,
      icon: wallet.icon,
    }));

  const selectedFromWallet = wallets.find((w) => w._id === fromWalletId);
  const transferAmount = Number(amount) || 0;

  return (
    <div>
      <Select
        value={fromWalletId}
        onChange={(e) => setFromWalletId(e.target.value)}
        label="From Wallet"
        placeholder="Select source wallet"
        options={fromWalletOptions}
        required
      />

      <Select
        value={toWalletId}
        onChange={(e) => setToWalletId(e.target.value)}
        label="To Wallet"
        placeholder="Select destination wallet"
        options={toWalletOptions}
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
        <p className="text-red-600 text-sm mt-1 mb-4">
          Insufficient balance. Available:{" "}
          {selectedFromWallet.balance.toFixed(2)}
        </p>
      )}

      <Input
        value={date}
        onChange={(e) => setDate(e.target.value)}
        label="Date"
        placeholder=""
        type="date"
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
