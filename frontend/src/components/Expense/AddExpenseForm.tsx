import { useState, useEffect } from "react";
import Input from "../Inputs/Input";
import Select from "../Inputs/Select";
import AutoComplete from "../Inputs/AutoComplete";
import EmojiPickerPopup from "../Inputs/EmojiPickerPopup";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import { formatCurrency } from "../../utils/helper";

export interface ExpenseData {
  categoryId: string;
  amount: number;
  date: string;
  icon: string;
  walletId: string;
  desc?: string;
}

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

interface AddExpenseFormProps {
  onAddExpense: (expense: ExpenseData) => void;
}

const AddExpenseForm = ({ onAddExpense }: AddExpenseFormProps) => {
  const [expense, setExpense] = useState<ExpenseData>({
    categoryId: "",
    amount: 0,
    date: "",
    icon: "",
    walletId: "",
    desc: "",
  });
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const fetchWallets = async () => {
      try {
        const response = await axiosInstance.get<Wallet[]>(
          API_PATHS.WALLET.GET_ALL
        );
        setWallets(response.data);
        if (response.data.length > 0) {
          setExpense((prev) => {
            if (!prev.walletId) {
              return { ...prev, walletId: response.data[0]._id };
            }
            return prev;
          });
        }
      } catch (error) {
        console.error("Error fetching wallets", error);
      }
    };
    fetchWallets();
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axiosInstance.get<{
          default?: Category[];
          custom?: Category[];
        }>(API_PATHS.CATEGORIES.GET_ALL, {
          params: { type: "EXPENSE" },
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
  }, []);

  const handleChange = (key: keyof ExpenseData, value: string) => {
    setExpense((prev) => {
      const updated = { ...prev, [key]: value };
      // Update icon when category changes
      if (key === "categoryId") {
        const selectedCategory = categories.find((cat) => cat._id === value);
        if (selectedCategory) {
          updated.icon = selectedCategory.icon;
        }
      }
      return updated;
    });
  };

  return (
    <div>
      <EmojiPickerPopup
        icon={expense.icon}
        onSelect={(selectedIcon: string) => handleChange("icon", selectedIcon)}
      />

      <AutoComplete
        value={expense.categoryId}
        onChange={(e) => handleChange("categoryId", e.target.value)}
        label="Expense Category"
        placeholder="Select or search for a category"
        options={categories.map((category) => ({
          value: category._id,
          label: category.name,
          icon: category.icon,
        }))}
        required
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
          label: `${wallet.name} (Balance: ${formatCurrency(wallet.balance)})`,
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

      <Input
        value={expense.desc || ""}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          handleChange("desc", e.target.value)
        }
        label="Note (Optional)"
        placeholder="Add a note"
        type="text"
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
