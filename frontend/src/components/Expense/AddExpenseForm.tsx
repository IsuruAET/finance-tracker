import { useState, useEffect } from "react";
import Input from "../Inputs/Input";
import Select from "../Inputs/Select";
import EmojiPickerPopup from "../Inputs/EmojiPickerPopup";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";

export interface ExpenseData {
  category: string;
  amount: number;
  date: string;
  icon: string;
  walletId: string;
}

interface Wallet {
  _id: string;
  name: string;
  type: "cash" | "card";
  balance: number;
  icon?: string;
  createdDate?: string;
}

interface AddExpenseFormProps {
  onAddExpense: (expense: ExpenseData) => void;
}

const AddExpenseForm = ({ onAddExpense }: AddExpenseFormProps) => {
  const [expense, setExpense] = useState<ExpenseData>({
    category: "",
    amount: 0,
    date: "",
    icon: "",
    walletId: "",
  });
  const [wallets, setWallets] = useState<Wallet[]>([]);

  useEffect(() => {
    const fetchWallets = async () => {
      try {
        const response = await axiosInstance.get<Wallet[]>(
          API_PATHS.WALLET.GET_ALL
        );
        setWallets(response.data);
        if (response.data.length > 0 && !expense.walletId) {
          setExpense((prev) => ({ ...prev, walletId: response.data[0]._id }));
        }
      } catch (error) {
        console.error("Error fetching wallets", error);
      }
    };
    fetchWallets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (key: keyof ExpenseData, value: string) => {
    setExpense((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div>
      <EmojiPickerPopup
        icon={expense.icon}
        onSelect={(selectedIcon: string) => handleChange("icon", selectedIcon)}
      />

      <Input
        value={expense.category}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          handleChange("category", e.target.value)
        }
        label="Expense Category"
        placeholder="Rent, Groceries, etc"
        type="text"
      />

      <Input
        value={String(expense.amount)}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          handleChange("amount", e.target.value)
        }
        label="Amount"
        placeholder=""
        type="number"
      />

      <Select
        value={expense.walletId}
        onChange={(e) => handleChange("walletId", e.target.value)}
        label="Pay from Wallet"
        placeholder="Select a wallet"
        options={wallets.map((wallet) => ({
          value: wallet._id,
          label: `${wallet.name} (Balance: ${wallet.balance.toFixed(2)})`,
          icon: wallet.icon,
        }))}
        required
      />

      <Input
        value={expense.date}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          handleChange("date", e.target.value)
        }
        label="Date"
        placeholder=""
        type="date"
      />

      <div className="flex justify-end mt-6">
        <button
          type="button"
          className="add-btn add-btn-fill"
          onClick={() => onAddExpense(expense)}
        >
          Add Expense
        </button>
      </div>
    </div>
  );
};

export default AddExpenseForm;
