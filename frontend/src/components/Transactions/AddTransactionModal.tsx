import { useState, useEffect } from "react";
import { DateTime } from "luxon";
import Input from "../Inputs/Input";
import Select from "../Inputs/Select";
import AutoComplete from "../Inputs/AutoComplete";
import DatePicker from "../Inputs/DatePicker";
import EmojiPickerPopup from "../Inputs/EmojiPickerPopup";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import { formatCurrency, categorizeWallets } from "../../utils/helper";
import toast from "react-hot-toast";
import axios from "axios";
import { LuWalletMinimal, LuHandCoins } from "react-icons/lu";
import { BiTransfer } from "react-icons/bi";

type TransactionType = "INCOME" | "EXPENSE" | "TRANSFER" | "";

interface Wallet {
  _id: string;
  name: string;
  type: "CASH" | "BANK" | "CARD" | "OTHER";
  balance: number;
  icon?: string;
  createdDate?: string;
}

interface Category {
  _id: string;
  name: string;
  type: "INCOME" | "EXPENSE";
  icon: string;
  isDefault?: boolean;
  userId?: string;
}

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const AddTransactionModal = ({
  isOpen,
  onClose,
  onSuccess,
}: AddTransactionModalProps) => {
  const [transactionType, setTransactionType] = useState<TransactionType>("");
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  // Income/Expense form state
  const [categoryId, setCategoryId] = useState("");
  const [amount, setAmount] = useState<string>("0");
  const [date, setDate] = useState(DateTime.now().toISODate() || "");
  const [icon, setIcon] = useState("");
  const [walletId, setWalletId] = useState("");
  const [desc, setDesc] = useState("");

  // Transfer form state
  const [fromWalletId, setFromWalletId] = useState("");
  const [toWalletId, setToWalletId] = useState("");
  const [transferAmount, setTransferAmount] = useState<string>("0");
  const [transferDate, setTransferDate] = useState(
    DateTime.now().toISODate() || ""
  );
  const [note, setNote] = useState("");

  // Fetch wallets
  useEffect(() => {
    if (isOpen) {
      const fetchWallets = async () => {
        try {
          const response = await axiosInstance.get<Wallet[]>(
            API_PATHS.WALLET.GET_ALL
          );
          setWallets(response.data);
          if (response.data.length > 0) {
            setWalletId(response.data[0]._id);
            setFromWalletId(response.data[0]._id);
          }
        } catch (error) {
          console.error("Error fetching wallets", error);
          toast.error("Failed to load wallets");
        }
      };
      fetchWallets();
    }
  }, [isOpen]);

  // Fetch categories when transaction type changes
  useEffect(() => {
    if (
      isOpen &&
      (transactionType === "INCOME" || transactionType === "EXPENSE")
    ) {
      const fetchCategories = async () => {
        try {
          const response = await axiosInstance.get<{
            default?: Category[];
            custom?: Category[];
          }>(API_PATHS.CATEGORIES.GET_ALL, {
            params: { type: transactionType },
          });
          const allCategories: Category[] = [
            ...(response.data?.default || []),
            ...(response.data?.custom || []),
          ];
          setCategories(allCategories);
        } catch (error) {
          console.error("Error fetching categories", error);
        }
      };
      fetchCategories();
    }
  }, [isOpen, transactionType]);

  // Reset form when modal closes or type changes
  useEffect(() => {
    if (!isOpen) {
      setTransactionType("");
      setCategoryId("");
      setAmount("0");
      setDate(DateTime.now().toISODate() || "");
      setIcon("");
      setWalletId("");
      setDesc("");
      setFromWalletId("");
      setToWalletId("");
      setTransferAmount("0");
      setTransferDate(DateTime.now().toISODate() || "");
      setNote("");
    }
  }, [isOpen]);

  // Update icon when category changes
  useEffect(() => {
    if (categoryId) {
      const selectedCategory = categories.find((cat) => cat._id === categoryId);
      if (selectedCategory) {
        setIcon(selectedCategory.icon);
      }
    }
  }, [categoryId, categories]);

  const handleIncomeExpenseSubmit = async () => {
    if (!categoryId) {
      toast.error("Category is required.");
      return;
    }

    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
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
        type: transactionType,
        amount: Number(amount),
        date,
        walletId,
        categoryId,
        desc,
      });

      toast.success(
        `${
          transactionType === "INCOME" ? "Income" : "Expense"
        } added successfully`
      );
      onSuccess?.();
      onClose();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(
          error.response?.data?.message ||
            "Something went wrong. Please try again."
        );
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    }
  };

  const handleTransferSubmit = async () => {
    const transferAmountNum = Number(transferAmount);

    if (
      !fromWalletId ||
      !toWalletId ||
      !transferAmountNum ||
      transferAmountNum <= 0
    ) {
      toast.error("Please fill all required fields with valid values");
      return;
    }

    if (fromWalletId === toWalletId) {
      toast.error("Cannot transfer to the same wallet");
      return;
    }

    const selectedFromWallet = wallets.find((w) => w._id === fromWalletId);
    if (selectedFromWallet && transferAmountNum > selectedFromWallet.balance) {
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
        amount: transferAmountNum,
        date: transferDate,
        note,
      });

      toast.success("Transfer completed successfully!");
      onSuccess?.();
      onClose();
    } catch (error: unknown) {
      const errorMessage =
        error && typeof error === "object" && "response" in error
          ? (error.response as { data?: { message?: string } })?.data?.message
          : undefined;
      toast.error(errorMessage || "Failed to complete transfer");
    }
  };

  const handleSubmit = () => {
    if (transactionType === "TRANSFER") {
      handleTransferSubmit();
    } else {
      handleIncomeExpenseSubmit();
    }
  };

  const getModalTitle = () => {
    if (!transactionType) return "Add Transaction";
    if (transactionType === "INCOME") return "Add Income";
    if (transactionType === "EXPENSE") return "Add Expense";
    return "Transfer Money";
  };

  const getButtonText = () => {
    if (transactionType === "TRANSFER") return "Transfer";
    if (transactionType === "INCOME") return "Add Income";
    if (transactionType === "EXPENSE") return "Add Expense";
    return "Continue";
  };

  const walletGroups = categorizeWallets(wallets);
  const toWalletGroups = categorizeWallets(
    wallets.filter((w) => w._id !== fromWalletId)
  );

  const categoryOptions = categories.map((category) => ({
    value: category._id,
    label: category.name,
    icon: category.icon,
  }));

  const selectedFromWallet = wallets.find((w) => w._id === fromWalletId);
  const transferAmountNum = Number(transferAmount) || 0;

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-center items-center w-full h-screen bg-black/50 dark:bg-black/75 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative p-4 w-full max-w-2xl max-h-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative bg-bg-primary rounded-lg shadow-sm transition-colors">
          <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t border-border transition-colors">
            <h3 className="text-lg font-medium text-text-primary transition-colors">
              {getModalTitle()}
            </h3>
            <button
              type="button"
              className="text-text-secondary bg-transparent hover:bg-hover hover:text-text-primary rounded-lg text-sm w-8 h-8 inline-flex justify-center items-center cursor-pointer transition-colors"
              onClick={onClose}
            >
              <svg
                className="w-3 h-3"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 14 14"
                aria-hidden="true"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M1 1L13 13M13 1L1 13"
                />
              </svg>
            </button>
          </div>

          <div className="p-4 md:p-5 space-y-4">
            {!transactionType ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2 transition-colors">
                    Select Transaction Type
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => setTransactionType("INCOME")}
                      className="w-full p-4 border-2 border-border rounded-lg hover:border-primary hover:bg-hover transition-colors text-left cursor-pointer"
                    >
                      <div className="mb-3 flex items-center sm:justify-start justify-center">
                        <div className="w-12 h-12 flex items-center justify-center text-white bg-green-500 rounded-full drop-shadow-xl">
                          <LuWalletMinimal className="text-2xl" />
                        </div>
                      </div>
                      <div className="font-medium text-text-primary transition-colors text-center sm:text-left">
                        Income
                      </div>
                      <div className="text-sm text-text-secondary transition-colors text-center sm:text-left">
                        Add money
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setTransactionType("EXPENSE")}
                      className="w-full p-4 border-2 border-border rounded-lg hover:border-primary hover:bg-hover transition-colors text-left cursor-pointer"
                    >
                      <div className="mb-3 flex items-center sm:justify-start justify-center">
                        <div className="w-12 h-12 flex items-center justify-center text-white bg-red-500 rounded-full drop-shadow-xl">
                          <LuHandCoins className="text-2xl" />
                        </div>
                      </div>
                      <div className="font-medium text-text-primary transition-colors text-center sm:text-left">
                        Expense
                      </div>
                      <div className="text-sm text-text-secondary transition-colors text-center sm:text-left">
                        Spend money
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setTransactionType("TRANSFER")}
                      className="w-full p-4 border-2 border-border rounded-lg hover:border-primary hover:bg-hover transition-colors text-left cursor-pointer"
                    >
                      <div className="mb-3 flex items-center sm:justify-start justify-center">
                        <div className="w-12 h-12 flex items-center justify-center text-white bg-blue-500 rounded-full drop-shadow-xl">
                          <BiTransfer className="text-2xl" />
                        </div>
                      </div>
                      <div className="font-medium text-text-primary transition-colors text-center sm:text-left">
                        Transfer
                      </div>
                      <div className="text-sm text-text-secondary transition-colors text-center sm:text-left">
                        Move money
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            ) : transactionType === "TRANSFER" ? (
              <div className="space-y-4">
                <Select
                  value={fromWalletId}
                  onChange={(e) => setFromWalletId(e.target.value)}
                  label="From Wallet"
                  placeholder="Select source wallet"
                  groups={walletGroups}
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
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(e.target.value)}
                  label="Amount"
                  placeholder="0"
                  type="number"
                />

                {selectedFromWallet &&
                  transferAmountNum > selectedFromWallet.balance && (
                    <p className="text-red-600 dark:text-red-400 text-sm mt-1 mb-4 transition-colors">
                      Insufficient balance. Available:{" "}
                      {formatCurrency(selectedFromWallet.balance)}
                    </p>
                  )}

                <DatePicker
                  value={transferDate}
                  onChange={setTransferDate}
                  label="Date"
                  placeholder="Select a date"
                />

                <Input
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  label="Note (Optional)"
                  placeholder="Add a note"
                  type="text"
                />
              </div>
            ) : (
              <div className="space-y-4">
                <EmojiPickerPopup
                  icon={icon}
                  onSelect={(selectedIcon: string) => setIcon(selectedIcon)}
                />

                <AutoComplete
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  label={
                    transactionType === "INCOME"
                      ? "Income Category"
                      : "Expense Category"
                  }
                  placeholder="Select or search for a category"
                  options={categoryOptions}
                  required
                />

                <Input
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  label="Amount"
                  placeholder=""
                  type="number"
                />

                <Select
                  value={walletId}
                  onChange={(e) => setWalletId(e.target.value)}
                  label={
                    transactionType === "INCOME"
                      ? "Add to Wallet"
                      : "Pay from Wallet"
                  }
                  placeholder="Select a wallet"
                  groups={walletGroups}
                  required
                />

                <DatePicker
                  value={date}
                  onChange={setDate}
                  label="Date"
                  placeholder="Select a date"
                />

                <Input
                  value={desc || ""}
                  onChange={(e) => setDesc(e.target.value)}
                  label="Note (Optional)"
                  placeholder="Add a note"
                  type="text"
                />
              </div>
            )}

            {transactionType && (
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  className="add-btn"
                  onClick={() => setTransactionType("")}
                >
                  Back
                </button>
                <button
                  type="button"
                  className="add-btn add-btn-fill"
                  onClick={handleSubmit}
                >
                  {getButtonText()}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddTransactionModal;
