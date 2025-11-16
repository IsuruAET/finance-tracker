import { useState } from "react";
import Input from "../Inputs/Input";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import toast from "react-hot-toast";
import { LuMinus, LuPlus } from "react-icons/lu";

interface Card {
  name: string;
  balance: number;
  icon: string;
}

interface InitializeWalletsProps {
  onComplete: () => void;
}

const InitializeWallets = ({ onComplete }: InitializeWalletsProps) => {
  const [cashInHand, setCashInHand] = useState<string>("0");
  const [cards, setCards] = useState<Card[]>([
    { name: "", balance: 0, icon: "💳" },
  ]);

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
    const cashAmount = Number(cashInHand) || 0;
    const validCards = cards.filter((card) => card.name.trim() !== "");

    if (cashAmount < 0) {
      toast.error("Cash in hand cannot be negative");
      return;
    }

    if (validCards.length === 0 && cashAmount === 0) {
      toast.error("Please add at least one wallet with a balance");
      return;
    }

    try {
      await axiosInstance.post(API_PATHS.WALLET.INITIALIZE, {
        cashInHand: cashAmount,
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
      <div className="mb-6">
        <Input
          value={cashInHand}
          onChange={(e) => setCashInHand(e.target.value)}
          label="Cash In Hand"
          placeholder="0"
          type="number"
        />
      </div>

      <div className="mb-6">
        <div className="flex justify-between items-center mb-3">
          <label className="text-[13px] text-slate-800">Card Wallets</label>
          <button type="button" onClick={addCard} className="add-btn">
            <LuPlus className="text-lg" />
            Add Card
          </button>
        </div>

        {cards.map((card, index) => (
          <div
            key={index}
            className="mb-4 p-4 border border-gray-200 rounded-lg bg-gray-50"
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
                  className="mt-8 inline-flex items-center justify-center rounded-full border border-red-200 text-red-600 hover:text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 transition-colors duration-150 p-2"
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

      <div className="flex justify-end mt-6">
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
