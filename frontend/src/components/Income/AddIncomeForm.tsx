import { useState, useEffect } from "react";
import { DateTime } from "luxon";
import Input from "../Inputs/Input";
import Select from "../Inputs/Select";
import AutoComplete from "../Inputs/AutoComplete";
import DatePicker from "../Inputs/DatePicker";
import EmojiPickerPopup from "../Inputs/EmojiPickerPopup";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import { categorizeWallets } from "../../utils/helper";

export interface IncomeData {
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

interface AddIncomeFormProps {
  onAddIncome: (income: IncomeData) => void;
}

const AddIncomeForm = ({ onAddIncome }: AddIncomeFormProps) => {
  const [income, setIncome] = useState<IncomeData>({
    categoryId: "",
    amount: 0,
    date: DateTime.now().toISODate() || "",
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
          setIncome((prev) => {
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
          params: { type: "INCOME" },
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

  const handleChange = (key: keyof IncomeData, value: string) => {
    setIncome((prev) => {
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
        icon={income.icon}
        onSelect={(selectedIcon: string) => handleChange("icon", selectedIcon)}
      />

      <AutoComplete
        value={income.categoryId}
        onChange={(e) => handleChange("categoryId", e.target.value)}
        label="Income Category"
        placeholder="Select or search for a category"
        options={categories.map((category) => ({
          value: category._id,
          label: category.name,
          icon: category.icon,
        }))}
        required
      />

      <Input
        value={String(income.amount)}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          handleChange("amount", e.target.value)
        }
        label="Amount"
        placeholder=""
        type="number"
      />

      <Select
        value={income.walletId}
        onChange={(e) => handleChange("walletId", e.target.value)}
        label="Add to Wallet"
        placeholder="Select a wallet"
        groups={categorizeWallets(wallets)}
        required
      />

      <DatePicker
        value={income.date}
        onChange={(value) => handleChange("date", value)}
        label="Date"
        placeholder="Select a date"
      />

      <Input
        value={income.desc || ""}
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
          onClick={() => onAddIncome(income)}
        >
          Add Income
        </button>
      </div>
    </div>
  );
};

export default AddIncomeForm;
