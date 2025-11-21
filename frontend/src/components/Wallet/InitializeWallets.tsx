import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Input from "../Inputs/Input";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import toast from "react-hot-toast";
import { LuMinus, LuPlus, LuLogOut } from "react-icons/lu";
import { useUserContext } from "../../context/UserContext";

interface CashWallet {
  name: string;
  balance: number;
}

interface Card {
  name: string;
  balance: number;
  icon: string;
}

interface InitializeWalletsProps {
  onComplete: () => void;
}

const InitializeWallets = ({ onComplete }: InitializeWalletsProps) => {
  const { clearUser } = useUserContext();
  const navigate = useNavigate();
  const [cashWallets, setCashWallets] = useState<CashWallet[]>([
    { name: "", balance: 0 },
  ]);
  const [cards, setCards] = useState<Card[]>([
    { name: "", balance: 0, icon: "💳" },
  ]);

  const handleLogout = () => {
    localStorage.clear();
    clearUser();
    navigate("/login");
  };

  const addCashWallet = () => {
    setCashWallets([...cashWallets, { name: "", balance: 0 }]);
  };

  const updateCashWallet = (
    index: number,
    field: keyof CashWallet,
    value: string | number
  ) => {
    const updated = [...cashWallets];
    updated[index] = { ...updated[index], [field]: value };
    setCashWallets(updated);
  };

  const removeCashWallet = (index: number) => {
    if (cashWallets.length > 1) {
      setCashWallets(cashWallets.filter((_, i) => i !== index));
    }
  };

  const addCard = () => {
    setCards([...cards, { name: "", balance: 0, icon: "💳" }]);
  };

  const updateCard = (
    index: number,
    field: keyof Card,
    value: string | number
  ) => {
    const updated = [...cards];
    updated[index] = { ...updated[index], [field]: value };
    setCards(updated);
  };

  const removeCard = (index: number) => {
    if (cards.length > 1) {
      setCards(cards.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async () => {
    const validCashWallets = cashWallets.filter(
      (cash) => cash.name.trim() !== ""
    );
    const validCards = cards.filter((card) => card.name.trim() !== "");

    // Validate balances
    for (const cash of validCashWallets) {
      if (Number(cash.balance) < 0) {
        toast.error("Cash wallet balance cannot be negative");
        return;
      }
    }

    for (const card of validCards) {
      if (Number(card.balance) < 0) {
        toast.error("Card wallet balance cannot be negative");
        return;
      }
    }

    if (validCashWallets.length === 0 && validCards.length === 0) {
      toast.error("Please add at least one wallet with a name");
      return;
    }

    // Check if at least one wallet has a balance > 0
    const hasBalance = [...validCashWallets, ...validCards].some(
      (wallet) => Number(wallet.balance) > 0
    );

    if (!hasBalance) {
      toast.error(
        "Please add at least one wallet with a balance greater than 0"
      );
      return;
    }

    try {
      await axiosInstance.post(API_PATHS.WALLET.INITIALIZE, {
        cashWallets: validCashWallets.map((cash) => ({
          name: cash.name,
          balance: Number(cash.balance) || 0,
        })),
        cards: validCards.map((card) => ({
          name: card.name,
          balance: Number(card.balance) || 0,
          icon: card.icon,
        })),
      });

      toast.success("Wallets initialized successfully!");
      onComplete();
    } catch (error: unknown) {
      const errorMessage =
        error && typeof error === "object" && "response" in error
          ? (error.response as { data?: { message?: string } })?.data?.message
          : undefined;
      toast.error(errorMessage || "Failed to initialize wallets");
    }
  };

  return (
    <div>
      <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/50 rounded-lg">
        <p className="text-sm text-blue-800 dark:text-blue-300">
          <strong>Welcome!</strong> To get started, you need to initialize at
          least one wallet with a balance greater than 0. If you don't want to
          add a wallet right now, you can logout and return later.
        </p>
      </div>

      <div className="mb-6">
        <div className="flex justify-between items-center mb-3">
          <label className="text-[13px] text-text-secondary transition-colors">
            Cash Wallets
          </label>
          <button type="button" onClick={addCashWallet} className="add-btn">
            <LuPlus className="text-lg" />
            Add Cash Wallet
          </button>
        </div>

        {cashWallets.map((cash, index) => (
          <div
            key={index}
            className="mb-4 p-4 border border-border rounded-lg bg-bg-secondary transition-colors"
          >
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1 mr-2">
                <Input
                  value={cash.name}
                  onChange={(e) =>
                    updateCashWallet(index, "name", e.target.value)
                  }
                  label="Cash Wallet Name"
                  placeholder="e.g., Wallet, Home Cash, Office Cash"
                  type="text"
                />
              </div>
              {cashWallets.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeCashWallet(index)}
                  className="mt-8 inline-flex items-center justify-center rounded-full border border-red-200 dark:border-red-800/50 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 bg-white dark:bg-bg-primary hover:bg-red-50 dark:hover:bg-red-900/20 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 transition-colors duration-150 p-2"
                  aria-label="Remove cash wallet"
                  title="Remove cash wallet"
                >
                  <LuMinus className="text-lg" />
                </button>
              )}
            </div>
            <Input
              value={String(cash.balance)}
              onChange={(e) =>
                updateCashWallet(index, "balance", e.target.value)
              }
              label="Initial Balance"
              placeholder="0"
              type="number"
            />
          </div>
        ))}
      </div>

      <div className="mb-6">
        <div className="flex justify-between items-center mb-3">
          <label className="text-[13px] text-text-secondary transition-colors">
            Card Wallets
          </label>
          <button type="button" onClick={addCard} className="add-btn">
            <LuPlus className="text-lg" />
            Add Card Wallet
          </button>
        </div>

        {cards.map((card, index) => (
          <div
            key={index}
            className="mb-4 p-4 border border-border rounded-lg bg-bg-secondary transition-colors"
          >
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1 mr-2">
                <Input
                  value={card.name}
                  onChange={(e) => updateCard(index, "name", e.target.value)}
                  label="Card Name"
                  placeholder="e.g., Debit Card, Credit Card"
                  type="text"
                />
              </div>
              {cards.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeCard(index)}
                  className="mt-8 inline-flex items-center justify-center rounded-full border border-red-200 dark:border-red-800/50 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 bg-white dark:bg-bg-primary hover:bg-red-50 dark:hover:bg-red-900/20 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 transition-colors duration-150 p-2"
                  aria-label="Remove card"
                  title="Remove card"
                >
                  <LuMinus className="text-lg" />
                </button>
              )}
            </div>
            <Input
              value={String(card.balance)}
              onChange={(e) => updateCard(index, "balance", e.target.value)}
              label="Initial Balance"
              placeholder="0"
              type="number"
            />
          </div>
        ))}
      </div>

      <div className="flex justify-between items-center mt-6">
        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-2 text-sm font-medium text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/50 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg px-4 py-2 transition-colors cursor-pointer"
        >
          <LuLogOut className="text-lg" />
          Logout
        </button>
        <button
          type="button"
          className="add-btn add-btn-fill"
          onClick={handleSubmit}
        >
          Initialize Wallets
        </button>
      </div>
    </div>
  );
};

export default InitializeWallets;
